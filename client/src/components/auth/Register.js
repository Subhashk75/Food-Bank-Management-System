'use client';
import {
  Flex, Box, FormControl, FormLabel, Input, Stack, Button,
  Heading, Text, Link, useToast, useColorModeValue, Select,
  FormErrorMessage
} from '@chakra-ui/react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { authService } from '../../components/utils/api';
import Auth from '../../components/utils/auth';

export default function SignupCard() {
  const [formState, setFormState] = useState({
    username: sessionStorage.getItem('regUsername') || '',
    email: sessionStorage.getItem('regEmail') || '',
    password: '',
    role: 'volunteer',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpPhase, setOtpPhase] = useState(sessionStorage.getItem('regOtpPhase') === 'true');
  const [verificationCode, setVerificationCode] = useState('');
  
  // Resend Timer Logic
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  const bgImageOverlay = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    if (Auth.loggedIn()) {
      navigate('/dashboard');
    }
    
    // Sync timer on mount if email exists
    if (formState.email && otpPhase) {
      syncOtpTimer();
    }
  }, []);

  const syncOtpTimer = async () => {
    try {
      const response = await authService.checkOtpStatus({ email: formState.email });
      if (response.success && response.remainingTime > 0) {
        setCountdown(response.remainingTime);
      }
    } catch (error) {
      console.error("Timer sync failed:", error);
    }
  };

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      setCanResend(false);
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    
    // Persist input values
    if (name === 'username') sessionStorage.setItem('regUsername', value);
    if (name === 'email') sessionStorage.setItem('regEmail', value);

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formState.username.trim()) newErrors.username = 'Username is required';
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formState.password) {
      newErrors.password = 'Password is required';
    } else if (formState.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGetOtp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await authService.requestOtp({ email: formState.email });
      if (response.success) {
        setOtpPhase(true);
        sessionStorage.setItem('regOtpPhase', 'true');
        setCountdown(response.remainingTime || 60); 
        toast({
          title: 'OTP Sent',
          description: response.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      }
    } catch (error) {
      if (error.status === 429 && error.data?.remainingTime) {
        setCountdown(error.data.remainingTime);
      }
      toast({
        title: 'OTP Request Failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!otpPhase) {
      await handleGetOtp();
      return;
    }

    if (!verificationCode || verificationCode.length < 6) {
      toast({
        title: 'Verification Error',
        description: 'Please enter the 6-digit code.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        ...formState,
        verificationCode,
      };

      const response = await authService.register(payload);
      
      if (response.success) {
        Auth.login(response.token);
        sessionStorage.clear(); // Clear all reg state

        toast({
          title: 'Registration Successful!',
          description: response.message,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: 'Registration Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH={'100vh'} align={'center'} justify={'center'} bg={bgImageOverlay}>
      <Stack spacing={8} mx={'auto'} w={'full'} maxW={'md'} py={12} px={6}>
        <Stack align={'center'} spacing={3}>
          <Heading fontSize={'3xl'} fontWeight="extrabold" textAlign="center">
            {otpPhase ? 'Verify Email' : 'Create an account'}
          </Heading>
          <Text fontSize={'lg'} color={'gray.500'} textAlign="center">
            {otpPhase 
              ? `Check your inbox for a code sent to ${formState.email}`
              : 'Join the mission to end hunger ✌️'}
          </Text>
        </Stack>
        <Box 
          rounded={'xl'} 
          bg={cardBg} 
          boxShadow={'xl'} 
          p={8} 
          border="1px" 
          borderColor={borderColor}
        >
          <form onSubmit={handleSubmit} noValidate>
            <Stack spacing={4}>
              <FormControl id="username" isRequired isInvalid={!!errors.username} isDisabled={otpPhase}>
                <FormLabel fontWeight="600">Username</FormLabel>
                <Input
                  type="text"
                  name="username"
                  autoComplete="username"
                  value={formState.username}
                  onChange={handleChange}
                  size="lg"
                  borderRadius="md"
                />
                <FormErrorMessage>{errors.username}</FormErrorMessage>
              </FormControl>

              <FormControl id="email" isRequired isInvalid={!!errors.email} isDisabled={otpPhase}>
                <FormLabel fontWeight="600">Email address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formState.email}
                  onChange={handleChange}
                  size="lg"
                  borderRadius="md"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl id="password" isRequired isInvalid={!!errors.password} isDisabled={otpPhase}>
                <FormLabel fontWeight="600">Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  autoComplete="new-password"
                  value={formState.password}
                  onChange={handleChange}
                  size="lg"
                  borderRadius="md"
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>

              <FormControl id="role" isRequired isDisabled={otpPhase}>
                <FormLabel fontWeight="600">Select Role</FormLabel>
                <Select
                  name="role"
                  value={formState.role}
                  onChange={handleChange}
                  size="lg"
                  borderRadius="md"
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="staff">Staff</option>
                </Select>
              </FormControl>

              {otpPhase && (
                <FormControl id="verificationCode" isRequired>
                  <FormLabel fontWeight="600">Verification OTP</FormLabel>
                  <Input
                    type="text"
                    name="verificationCode"
                    autoComplete="one-time-code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    size="lg"
                    borderRadius="md"
                    placeholder="Enter code from email"
                    maxLength={6}
                  />
                  <Flex justify="space-between" align="center" mt={2}>
                    <Text fontSize="sm" color="gray.500">
                      {canResend ? (
                        <Link color="brand.500" fontWeight="bold" onClick={handleGetOtp}>
                          Resend OTP
                        </Link>
                      ) : (
                        `Resend available in ${countdown}s`
                      )}
                    </Text>
                    <Link 
                      fontSize="sm" 
                      color="brand.500" 
                      onClick={() => {
                        setOtpPhase(false);
                        sessionStorage.removeItem('regOtpPhase');
                      }}
                    >
                      Back to Details
                    </Link>
                  </Flex>
                </FormControl>
              )}

              <Stack spacing={10} pt={4}>
                <Button
                  size="lg"
                  bg={'brand.500'}
                  color={'white'}
                  type="submit"
                  isLoading={isLoading}
                  isDisabled={!canResend && !otpPhase}
                  loadingText={otpPhase ? 'Verifying...' : 'Sending OTP...'}
                  _hover={{ bg: 'brand.600' }}
                  boxShadow="md"
                >
                  {!otpPhase ? (canResend ? 'Get OTP' : `Wait ${countdown}s`) : 'Verify & Sign Up'}
                </Button>
              </Stack>

              <Stack pt={4}>
                <Text align={'center'} color="gray.500">
                  Already a user? <Link color={'brand.500'} fontWeight="bold" as={ReactRouterLink} to='/'>Login</Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}
