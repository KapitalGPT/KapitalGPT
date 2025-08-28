import React, { useState, useEffect, useRef } from 'react';
import { X, Phone, Mic, MicOff, Volume2, MessageSquare, PhoneCall } from 'lucide-react';

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  startColdCallDemo?: boolean;
}

type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking' | 'ringing' | 'cold_call_active';

// AI names categorized by gender for matching with voice
const MALE_AI_NAMES = ['Alex', 'Mike', 'David', 'Ryan', 'James', 'Chris', 'Daniel', 'Mark'];
const FEMALE_AI_NAMES = ['Sarah', 'Emma', 'Lisa', 'Maya', 'Jennifer', 'Michelle', 'Karen', 'Victoria'];

// Cold call script with timing
const COLD_CALL_SCRIPT = [
  {
    speaker: 'ai',
    getText: (aiName: string) => `Hey there, my name is ${aiName} and I'm the co-founder of KapitalGPT. I was just calling to find out a little bit more about the type of companies that you invest in and who I would be able to talk to about that.`,
    delayAfterMs: 3000
  },
  {
    speaker: 'recipient',
    getText: () => `Sure, what kind of companies are you looking for?`,
    delayAfterMs: 1000
  },
  {
    speaker: 'ai',
    getText: () => `We're a fintech startup. We focus on AI-driven financial models. I was hoping to find the right person on your team who handles early-stage fintech investments.`,
    delayAfterMs: 1000
  },
  {
    speaker: 'recipient',
    getText: () => `Okay, I can connect you with our analyst who handles that. What's your email?`,
    delayAfterMs: 1000
  },
  {
    speaker: 'ai',
    getText: () => `Oh, and by the way, I was just checking out your company's blog post on 'The Future of Fintech.' Really great stuff—I especially liked how you broke down the key challenges. It's a topic we're really passionate about, too. Anyway, thank you for that information! My email is Money@kapitalgpt.com.`,
    delayAfterMs: 0
  }
];

export function VoiceAgentModal({ isOpen, onClose, startColdCallDemo = false }: VoiceAgentModalProps) {
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [conversationLog, setConversationLog] = useState<Array<{ type: 'user' | 'agent'; message: string }>>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [aiVoice, setAiVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [recipientVoice, setRecipientVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [aiName, setAiName] = useState('');
  const [isColdCallActive, setIsColdCallActive] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const phoneRingAudioRef = useRef<HTMLAudioElement | null>(null);
  const isCallActiveRef = useRef(false);
  const ringTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to determine voice gender based on voice name
  const getVoiceGender = (voice: SpeechSynthesisVoice): 'male' | 'female' | 'unknown' => {
    const name = voice.name.toLowerCase();
    
    // Check for explicit gender indicators
    if (name.includes('male') && !name.includes('female')) return 'male';
    if (name.includes('female') && !name.includes('male')) return 'female';
    if (name.includes('man') && !name.includes('woman')) return 'male';
    if (name.includes('woman') && !name.includes('man')) return 'female';
    
    // Check for common male voice names
    const maleNames = [
      'david', 'mark', 'daniel', 'tom', 'alex', 'ryan', 'james', 'guy', 'ravi', 
      'christopher', 'michael', 'john', 'paul', 'steve', 'brian', 'kevin', 'matt'
    ];
    
    // Check for common female voice names
    const femaleNames = [
      'samantha', 'victoria', 'karen', 'susan', 'zira', 'sarah', 'emma', 'lisa', 
      'aria', 'hazel', 'jenny', 'michelle', 'helen', 'anna', 'kate', 'mary', 'amy'
    ];
    
    for (const maleName of maleNames) {
      if (name.includes(maleName)) return 'male';
    }
    
    for (const femaleName of femaleNames) {
      if (name.includes(femaleName)) return 'female';
    }
    
    return 'unknown';
  };

  // Comprehensive cleanup function
  const performCleanupAndClose = () => {
    // Cancel any ongoing speech synthesis
    speechSynthesis.cancel();
    
    // Stop and reset audio
    if (phoneRingAudioRef.current) {
      phoneRingAudioRef.current.pause();
      phoneRingAudioRef.current.currentTime = 0;
    }
    
    // Clear timeouts
    if (ringTimeoutRef.current) {
      clearTimeout(ringTimeoutRef.current);
      ringTimeoutRef.current = null;
    }
    
    // Reset call state
    setIsColdCallActive(false);
    isCallActiveRef.current = false;
    setConversationState('idle');
    
    // Close modal
    onClose();
  };

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setConversationState('idle');
      setConversationLog([]);
      setError(null);
      setTextInput('');
      setIsColdCallActive(false);
      isCallActiveRef.current = false;
      
      // Clear any existing timeouts
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = null;
      }
      
      // Stop any playing ring sound
      if (phoneRingAudioRef.current) {
        phoneRingAudioRef.current.pause();
        phoneRingAudioRef.current.currentTime = 0;
      }
      
      // Start cold call demo if requested
      if (startColdCallDemo) {
        startColdCallSimulation();
      }
    } else {
      // Clean up when modal closes
      speechSynthesis.cancel();
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = null;
      }
      isCallActiveRef.current = false;
    }
  }, [isOpen, startColdCallDemo]);

  // Cleanup audio when component unmounts or modal closes
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      if (phoneRingAudioRef.current) {
        phoneRingAudioRef.current.pause();
        phoneRingAudioRef.current.currentTime = 0;
      }
      if (ringTimeoutRef.current) {
        clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = null;
      }
      isCallActiveRef.current = false;
    };
  }, []);
  
  const selectRandomVoices = (): { aiVoice: SpeechSynthesisVoice | null; recipientVoice: SpeechSynthesisVoice | null; aiName: string } => {
    if (availableVoices.length === 0) return;

    // Filter for English voices, prioritizing American English
    const americanVoices = availableVoices.filter(voice => 
      voice.lang === 'en-US'
    );
    
    const otherEnglishVoices = availableVoices.filter(voice => 
      (voice.lang.startsWith('en-') || voice.lang === 'en') && voice.lang !== 'en-US'
    );
    
    // Combine with American voices first, then other English voices
    const englishVoices = [...americanVoices, ...otherEnglishVoices];
    
    if (englishVoices.length === 0) {
      console.warn('No English voices found, using all available voices');
      englishVoices.push(...availableVoices);
    }

    // Prioritize high-quality, natural-sounding voices (less robotic)
    const priorityVoices = englishVoices.filter(voice => {
      const name = voice.name.toLowerCase();
      return (
        // Google voices (usually very natural)
        name.includes('google') ||
        // Microsoft voices (usually very natural)
        name.includes('microsoft') ||
        // Apple voices (usually very natural)
        name.includes('apple') ||
        // Specific high-quality, natural voice names
        name.includes('samantha') ||
        name.includes('alex') ||
        name.includes('victoria') ||
        name.includes('daniel') ||
        name.includes('karen') ||
        name.includes('tom') ||
        name.includes('susan') ||
        name.includes('david') ||
        name.includes('zira') ||
        name.includes('mark') ||
        name.includes('aria') ||
        name.includes('guy') ||
        name.includes('hazel') ||
        name.includes('ravi') ||
        name.includes('jenny') ||
        name.includes('christopher') ||
        name.includes('michelle') ||
        name.includes('helen') ||
        name.includes('anna') ||
        name.includes('kate') ||
        name.includes('mary') ||
        name.includes('amy') ||
        name.includes('john') ||
        name.includes('paul') ||
        name.includes('steve') ||
        // Neural, enhanced, or premium voices (most natural)
        name.includes('neural') ||
        name.includes('enhanced') ||
        name.includes('premium') ||
        name.includes('natural') ||
        name.includes('wavenet') ||
        name.includes('studio') ||
        name.includes('journey') ||
        name.includes('nova') ||
        // Exclude obviously robotic or low-quality voices
        (!name.includes('robot') && 
         !name.includes('espeak') && 
         !name.includes('festival') &&
         !name.includes('flite') &&
         !name.includes('pico') &&
         !name.includes('eSpeak'))
      );
    });

    // Use priority voices if available, otherwise use all English voices
    const voicesToUse = priorityVoices.length > 0 ? priorityVoices : englishVoices;

    // Categorize by gender using our helper function
    const maleVoices = voicesToUse.filter(voice => getVoiceGender(voice) === 'male');
    const femaleVoices = voicesToUse.filter(voice => getVoiceGender(voice) === 'female');
    const unknownGenderVoices = voicesToUse.filter(voice => getVoiceGender(voice) === 'unknown');
    
    // Further categorize by American vs other English within gender groups
    const americanMaleVoices = maleVoices.filter(voice => voice.lang === 'en-US');
    const americanFemaleVoices = femaleVoices.filter(voice => voice.lang === 'en-US');
    const otherMaleVoices = maleVoices.filter(voice => voice.lang !== 'en-US');
    const otherFemaleVoices = femaleVoices.filter(voice => voice.lang !== 'en-US');

    // Select AI voice (KapitalGPT representative) - prefer American English, any gender
    let selectedAiVoice;
    let selectedAiGender: 'male' | 'female' | 'unknown' = 'unknown';
    
    // Priority order: American female, American male, other English female, other English male, unknown gender
    if (americanFemaleVoices.length > 0) {
      selectedAiVoice = americanFemaleVoices[Math.floor(Math.random() * americanFemaleVoices.length)];
      selectedAiGender = 'female';
    } else if (americanMaleVoices.length > 0) {
      selectedAiVoice = americanMaleVoices[Math.floor(Math.random() * americanMaleVoices.length)];
      selectedAiGender = 'male';
    } else if (otherFemaleVoices.length > 0) {
      selectedAiVoice = otherFemaleVoices[Math.floor(Math.random() * otherFemaleVoices.length)];
      selectedAiGender = 'female';
    } else if (otherMaleVoices.length > 0) {
      selectedAiVoice = otherMaleVoices[Math.floor(Math.random() * otherMaleVoices.length)];
      selectedAiGender = 'male';
    } else if (unknownGenderVoices.length > 0) {
      selectedAiVoice = unknownGenderVoices[Math.floor(Math.random() * unknownGenderVoices.length)];
      selectedAiGender = 'unknown';
    } else {
      // Final fallback - any available voice
      selectedAiVoice = voicesToUse[Math.floor(Math.random() * voicesToUse.length)];
      selectedAiGender = getVoiceGender(selectedAiVoice);
    }
    
    // Select AI name based on detected gender
    let selectedAiName: string;
    if (selectedAiGender === 'female') {
      selectedAiName = FEMALE_AI_NAMES[Math.floor(Math.random() * FEMALE_AI_NAMES.length)];
    } else if (selectedAiGender === 'male') {
      selectedAiName = MALE_AI_NAMES[Math.floor(Math.random() * MALE_AI_NAMES.length)];
    } else {
      // For unknown gender, randomly pick from either list
      const allNames = [...MALE_AI_NAMES, ...FEMALE_AI_NAMES];
      selectedAiName = allNames[Math.floor(Math.random() * allNames.length)];
    }

    // Select recipient voice (company representative) - ensure it's different from AI voice
    const remainingVoices = voicesToUse.filter(voice => voice !== selectedAiVoice);
    let selectedRecipientVoice;
    
    if (remainingVoices.length > 0) {
      // Try to select opposite gender for variety, preferring American voices
      if (selectedAiGender === 'female') {
        // AI is female, try to get male recipient (American first)
        const availableAmericanMaleVoices = americanMaleVoices.filter(voice => voice !== selectedAiVoice);
        const availableOtherMaleVoices = otherMaleVoices.filter(voice => voice !== selectedAiVoice);
        
        if (availableAmericanMaleVoices.length > 0) {
          selectedRecipientVoice = availableAmericanMaleVoices[Math.floor(Math.random() * availableAmericanMaleVoices.length)];
        } else if (availableOtherMaleVoices.length > 0) {
          selectedRecipientVoice = availableOtherMaleVoices[Math.floor(Math.random() * availableOtherMaleVoices.length)];
        } else {
          // Fallback to any remaining voice
          selectedRecipientVoice = remainingVoices[Math.floor(Math.random() * remainingVoices.length)];
        }
      } else if (selectedAiGender === 'male') {
        // AI is male, try to get female recipient (American first)
        const availableAmericanFemaleVoices = americanFemaleVoices.filter(voice => voice !== selectedAiVoice);
        const availableOtherFemaleVoices = otherFemaleVoices.filter(voice => voice !== selectedAiVoice);
        
        if (availableAmericanFemaleVoices.length > 0) {
          selectedRecipientVoice = availableAmericanFemaleVoices[Math.floor(Math.random() * availableAmericanFemaleVoices.length)];
        } else if (availableOtherFemaleVoices.length > 0) {
          selectedRecipientVoice = availableOtherFemaleVoices[Math.floor(Math.random() * availableOtherFemaleVoices.length)];
        } else {
          // Fallback to any remaining voice
          selectedRecipientVoice = remainingVoices[Math.floor(Math.random() * remainingVoices.length)];
        }
      } else {
        // AI gender is unknown, just pick any different high-quality voice, preferring American
        const availableAmericanVoices = americanVoices.filter(voice => voice !== selectedAiVoice);
        if (availableAmericanVoices.length > 0) {
          selectedRecipientVoice = availableAmericanVoices[Math.floor(Math.random() * availableAmericanVoices.length)];
        } else {
          selectedRecipientVoice = remainingVoices[Math.floor(Math.random() * remainingVoices.length)];
        }
      }
    } else {
      // Fallback if only one voice available (shouldn't happen with modern browsers)
      selectedRecipientVoice = voicesToUse[0];
    }
    

    // Enhanced debug logging
    console.log('Voice Selection Results:');
    console.log('Available American voices:', americanVoices.length);
    console.log('Available other English voices:', otherEnglishVoices.length);
    console.log('Total English voices:', englishVoices.length);
    console.log('Priority voices found:', priorityVoices.length);
    console.log('Selected AI name:', selectedAiName, '(Gender:', selectedAiGender, ')');
    console.log('Selected AI voice:', selectedAiVoice?.name, selectedAiVoice?.lang, '(American:', selectedAiVoice?.lang === 'en-US' ? 'Yes' : 'No', ')');
    console.log('Selected recipient voice:', selectedRecipientVoice?.name, selectedRecipientVoice?.lang, '(American:', selectedRecipientVoice?.lang === 'en-US' ? 'Yes' : 'No', ')');

    // Return the selected voices and matched name
    return { aiVoice: selectedAiVoice, recipientVoice: selectedRecipientVoice, aiName: selectedAiName };
  };

  const speakText = (text: string, voiceToUse?: SpeechSynthesisVoice | null, onEndCallback?: () => void) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optimize speech parameters for natural human-like delivery
      utterance.rate = 1.0; // Normal human speaking rate
      utterance.pitch = 1.0; // Natural pitch
      utterance.volume = 1.0; // Full volume
      
      // Flag to ensure callback is only executed once
      let callbackExecuted = false;
      
      const executeOnceCallback = () => {
        if (callbackExecuted) return;
        callbackExecuted = true;
        
        if (onEndCallback) {
          onEndCallback();
        } else {
          setConversationState('idle');
        }
      };
      
      // Use provided voice or find the best English voice
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      } else {
        const voices = speechSynthesis.getVoices();
        const englishVoices = voices.filter(voice => 
          voice.lang.startsWith('en-') || voice.lang === 'en'
        );
        
        // Prefer high-quality English voices
        const preferredVoice = englishVoices.find(voice => {
          const name = voice.name.toLowerCase();
          return (
            name.includes('google') || 
            name.includes('microsoft') ||
            name.includes('apple') ||
            name.includes('samantha') ||
            name.includes('alex') ||
            name.includes('neural') ||
            name.includes('enhanced')
          );
        }) || englishVoices[0] || voices[0];
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }
      }
      
      utterance.onend = executeOnceCallback;
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        // Continue with callback even if speech fails
        executeOnceCallback();
      };
      
      speechSynthesis.speak(utterance);
    } else {
      // Fallback: just show the text and reset state
      setTimeout(() => {
        if (onEndCallback) {
          onEndCallback();
        } else {
          setConversationState('idle');
        }
      }, 3000);
    }
  };

  const startColdCallSimulation = () => {
    setIsColdCallActive(true);
    isCallActiveRef.current = true;
    setConversationLog([]);
    setConversationState('ringing');
    
    // Select voices and get gender-matched AI name
    const selectedVoices = selectRandomVoices();
    
    // Set the voices and name in state for UI display
    if (selectedVoices) {
      setAiVoice(selectedVoices.aiVoice);
      setRecipientVoice(selectedVoices.recipientVoice);
      setAiName(selectedVoices.aiName);
    }
    
    // Play phone ringing sound
    if (phoneRingAudioRef.current) {
      phoneRingAudioRef.current.loop = true;
      const playPromise = phoneRingAudioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Could not play ring sound:', error);
          // Audio failed, but continue with timeout below
        });
      }
    }
    
    // Random ring duration (2-5 rings, ~1 second per ring)
    const ringCount = Math.floor(Math.random() * 4) + 2; // 2-5 rings
    const ringDuration = ringCount * 1000;
    
    ringTimeoutRef.current = setTimeout(() => {
      // Stop ringing sound
      if (phoneRingAudioRef.current) {
        phoneRingAudioRef.current.pause();
        phoneRingAudioRef.current.currentTime = 0;
      }
      
      if (isCallActiveRef.current) {
        setConversationState('cold_call_active');
        executeColdCallScriptStep(0, selectedVoices?.aiName || 'Alex', selectedVoices?.aiVoice || null, selectedVoices?.recipientVoice || null);
      }
      ringTimeoutRef.current = null;
    }, ringDuration);
  };

  const executeColdCallScriptStep = (stepIndex: number, aiName: string, currentAiVoice: SpeechSynthesisVoice | null, currentRecipientVoice: SpeechSynthesisVoice | null) => {
    // Check if call is still active - allows ending the call
    if (!isCallActiveRef.current) {
      console.log('Call ended, stopping script execution.');
      return;
    }

    if (stepIndex >= COLD_CALL_SCRIPT.length) {
      // Call completed
      setIsColdCallActive(false);
      isCallActiveRef.current = false;
      setConversationState('idle');
      
      // Ensure ring sound is stopped
      if (phoneRingAudioRef.current) {
        phoneRingAudioRef.current.pause();
        phoneRingAudioRef.current.currentTime = 0;
      }
      return;
    }

    const step = COLD_CALL_SCRIPT[stepIndex];
    const message = step.getText(aiName);
    const speaker = step.speaker === 'ai' ? 'agent' : 'user';
    
    // Add message to conversation log
    setConversationLog(prev => [...prev, { type: speaker, message }]);
    
    // Speak the message
    setConversationState('speaking');
    const voiceToUse = step.speaker === 'ai' ? currentAiVoice : currentRecipientVoice;
    
    speakText(message, voiceToUse, () => {
      // Check again if call is still active before proceeding
      if (!isCallActiveRef.current) {
        console.log('Call ended during speech, stopping script execution.');
        return;
      }

      if (step.delayAfterMs > 0) {
        setConversationState('processing');
        setTimeout(() => {
          executeColdCallScriptStep(stepIndex + 1, aiName, currentAiVoice, currentRecipientVoice);
        }, step.delayAfterMs);
      } else {
        executeColdCallScriptStep(stepIndex + 1, aiName, currentAiVoice, currentRecipientVoice);
      }
    });
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      setError(null);
      
      // Set up MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudioInput(audioBlob);
        audioChunksRef.current = [];
      };

      return true;
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions and try again.');
      setHasPermission(false);
      return false;
    }
  };

  const startListening = async () => {
    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      setConversationState('listening');
      mediaRecorderRef.current.start();
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopListening();
        }
      }, 10000);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setConversationState('processing');
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    try {
      // Simulate AI processing - replace with actual API call
      setConversationState('processing');
      
      // Mock transcription with KapitalGPT-specific responses
      const mockTranscriptions = [
        "How can I find investors for my startup?",
        "What is the funding process like?",
        "Can you help me with my pitch deck?",
        "How do I know if an investor is right for me?",
        "What information do I need to provide?"
      ];
      const randomTranscription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      setConversationLog(prev => [...prev, { type: 'user', message: randomTranscription }]);
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock AI responses tailored to KapitalGPT
      const responses = {
        "How can I find investors for my startup?": "Great question! KapitalGPT uses AI to match you with the right investors based on your industry, funding stage, and location. Simply fill out our funding form, and we'll connect you with investors from our database of 50,000+ verified investors who are actively looking for startups like yours.",
        "What is the funding process like?": "The funding process on KapitalGPT is streamlined: First, you complete our detailed startup profile. Then our AI analyzes your information and matches you with relevant investors. You'll receive a list of potential investors with their contact information and investment criteria. Finally, you can reach out directly or use our AI-powered outreach tools.",
        "Can you help me with my pitch deck?": "While I can't create your pitch deck directly, I can guide you on what investors typically look for: a clear problem statement, your solution, market size, business model, traction, team background, and funding requirements. Our investor matches will also show you what each investor specifically values in their portfolio companies.",
        "How do I know if an investor is right for me?": "Excellent question! Our AI matching system considers several factors: investment stage alignment, industry focus, geographic preferences, typical investment amounts, and portfolio companies. Each match comes with a compatibility score and detailed reasons why that investor might be interested in your startup.",
        "What information do I need to provide?": "To get the best matches, you'll need: company name and type, business category, funding amount needed, investment stage, detailed business description, location, and contact information. The more detailed your information, the better our AI can match you with the right investors."
      };
      
      const mockResponse = responses[randomTranscription as keyof typeof responses] || 
        "I'm here to help you navigate KapitalGPT and connect with the right investors for your startup. Our platform has helped founders raise millions by using AI to match them with relevant investors. What specific aspect of fundraising would you like to know more about?";
      
      setConversationLog(prev => [...prev, { type: 'agent', message: mockResponse }]);
      
      // Simulate text-to-speech
      setConversationState('speaking');
      speakText(mockResponse);
      
    } catch (err) {
      setError('Failed to process audio. Please try again.');
      setConversationState('idle');
    }
  };

  const handleTextSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    setConversationLog(prev => [...prev, { type: 'user', message: textInput }]);
    setConversationState('processing');
    
    // Mock AI response for text input with KapitalGPT context
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const contextualResponses = {
      "funding": "KapitalGPT specializes in connecting startups with the right investors. Our AI analyzes your startup profile and matches you with investors who are actively looking for companies in your industry and stage.",
      "investors": "We have a database of over 50,000 verified investors including VCs, angel investors, family offices, and corporate investors. Each investor profile includes their investment criteria, portfolio companies, and contact information.",
      "pitch": "A strong pitch should clearly communicate your value proposition, market opportunity, and why you're the right team to execute. Our investor matches will show you what each specific investor looks for in their investments.",
      "valuation": "Valuation depends on many factors including your industry, traction, market size, and comparable companies. Our investor matches include investors who typically invest at your stage and can provide guidance on appropriate valuations.",
      "equity": "Equity considerations vary by funding stage and investor type. Seed investors typically take 15-25%, while Series A investors might take 20-30%. Our platform shows you each investor's typical equity expectations."
    };
    
    const inputLower = textInput.toLowerCase();
    let response = `I understand you're asking about "${textInput}". `;
    
    // Find contextual response
    const contextKey = Object.keys(contextualResponses).find(key => inputLower.includes(key));
    if (contextKey) {
      response += contextualResponses[contextKey as keyof typeof contextualResponses];
    } else {
      response += "As your AI assistant for KapitalGPT, I can help you understand our platform, the fundraising process, investor matching, and how to optimize your startup profile for better matches. What specific information would you like to know?";
    }
    
    setConversationLog(prev => [...prev, { type: 'agent', message: response }]);
    
    setConversationState('speaking');
    speakText(response);
    setTextInput('');
  };

  const getStateMessage = () => {
    switch (conversationState) {
      case 'ringing':
        return 'Phone is ringing...';
      case 'cold_call_active':
        return 'AI Cold Call in progress...';
      case 'listening':
        return 'Listening... Speak now';
      case 'processing':
        return isColdCallActive ? 'AI is thinking...' : 'Processing your request...';
      case 'speaking':
        return isColdCallActive ? 'Call in progress...' : 'AI Assistant is responding...';
      default:
        return isColdCallActive ? 'Cold call demo active' : 'Ready to help you raise capital';
    }
  };

  const getStateIcon = () => {
    switch (conversationState) {
      case 'ringing':
        return <PhoneCall className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'cold_call_active':
        return <Phone className="w-6 h-6 text-green-500" />;
      case 'listening':
        return <Mic className="w-6 h-6 text-red-500 animate-pulse" />;
      case 'processing':
        return <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'speaking':
        return <Volume2 className="w-6 h-6 text-green-500 animate-pulse" />;
      default:
        return <Phone className="w-6 h-6 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* Hidden audio element for phone ring sound */}
      <audio
        ref={phoneRingAudioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        {/* 
          TODO: Replace with actual phone ring sound file
          You can use a royalty-free phone ring sound from:
          - https://mixkit.co/free-sound-effects/phone/
          - https://www.soundjay.com/misc/sounds-1.html
          - Or record your own phone ring sound
        */}
        <source src="/phone-ring.mp3" type="audio/mpeg" />
        <source src="/phone-ring.wav" type="audio/wav" />
        {/* Fallback for browsers that don't support audio */}
        Your browser does not support the audio element.
      </audio>
      
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                {getStateIcon()}
              </div>
              <div>
                <h2 className="text-xl font-bold">KapitalGPT AI Assistant</h2>
                <p className="text-blue-100 text-sm">{getStateMessage()}</p>
              </div>
            </div>
            <button
              onClick={performCleanupAndClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>


        {/* Conversation Log */}
        <div className="p-4 max-h-60 overflow-y-auto">
          {conversationLog.length === 0 ? (
            <div className="text-center py-8">
              {isColdCallActive ? (
                <div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhoneCall className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    AI Cold Call Demo
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Experience how KapitalGPT's AI makes professional cold calls to investors on your behalf.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Hello! I'm your KapitalGPT AI Co-Founder
                  </h3>
                  <p className="text-gray-600 text-sm">
                    I can help you with questions about fundraising, finding investors, understanding our platform, 
                    or optimizing your startup profile. Click the microphone to start talking or use the text input below.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {conversationLog.map((entry, index) => (
                <div
                  key={index}
                  className={`flex ${entry.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      entry.type === 'user'
                        ? 'bg-gray-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {isColdCallActive && (
                      <div className="text-xs opacity-75 mb-1">
                        {entry.type === 'user' ? 'VC Representative' : `${aiName} (KapitalGPT)`}
                      </div>
                    )}
                    <p className="text-sm">{entry.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Controls */}
        <div className="p-4 border-t bg-gray-50">
          {isColdCallActive ? (
            <div className="text-center">
              <div className="flex justify-center space-x-4 mb-4">
                <button
                  onClick={() => {
                    performCleanupAndClose();
                  }}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  End Call
                </button>
              </div>
              <p className="text-sm text-gray-600">
                This is a demo of how KapitalGPT's AI conducts professional cold calls to investors.
              </p>
            </div>
          ) : !showTextInput ? (
            <div className="space-y-4">
              {/* Voice Controls */}
              <div className="flex justify-center space-x-4">
                {conversationState === 'listening' ? (
                  <button
                    onClick={stopListening}
                    className="bg-red-600 text-white p-4 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                  >
                    <MicOff className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    onClick={startListening}
                    disabled={conversationState !== 'idle' || isColdCallActive}
                    className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Mic className="w-6 h-6" />
                  </button>
                )}
              </div>

              {/* Switch to Text Input */}
              <button
                onClick={() => setShowTextInput(true)}
                disabled={isColdCallActive}
                className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Type instead</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Text Input */}
              <form onSubmit={handleTextSubmit} className="flex space-x-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ask about fundraising, investors, or our platform..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={conversationState !== 'idle' || isColdCallActive}
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || conversationState !== 'idle' || isColdCallActive}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </form>

              {/* Switch to Voice Input */}
              <button
                onClick={() => setShowTextInput(false)}
                disabled={isColdCallActive}
                className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <Mic className="w-4 h-4" />
                <span className="text-sm">Use voice instead</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions - Only show when not in cold call mode */}
        {!isColdCallActive && (
          <div className="p-4 bg-gray-100 border-t">
            <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {[
                "How do I find investors?",
                "What's the funding process?",
                "Help with my pitch",
                "Investor requirements"
              ].map((question) => (
                <button
                  key={question}
                  onClick={() => {
                    setTextInput(question);
                    setShowTextInput(true);
                  }}
                  className="text-xs bg-white text-gray-700 px-2 py-1 rounded border hover:bg-gray-50 transition-colors"
                  disabled={conversationState !== 'idle'}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}