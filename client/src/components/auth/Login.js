'use client'
import { 
  Button, Flex, Text, FormControl, FormLabel, Heading, Input, 
  Stack, Image, Box, Link, useToast, useColorModeValue, FormErrorMessage 
} from '@chakra-ui/react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../../components/utils/api';
import Auth from '../../components/utils/auth';
import FoodLogo from '../../assets/FoodLogo.jpg';
import FoodPlate from '../../assets/girl-apples.png';

const Login = () => {
  const [formState, setFormState] = useState({ 
    email: sessionStorage.getItem('pendingAuthEmail') || '', 
    password: '' 
  });
  const [otp, setOtp] = useState('');
  const [isOtpStage, setIsOtpStage] = useState(sessionStorage.getItem('isOtpStage') === 'true');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Resend Timer Logic
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

  const navigate = useNavigate();
  const toast = useToast();

  const bgImageOverlay = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    if (Auth.loggedIn()) {
      navigate('/dashboard', { replace: true });
    }
    
    // Check OTP status on mount if email exists
    if (formState.email && isOtpStage) {
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
      console.error("Failed to sync timer:", error);
    }
  };

  // Countdown effect
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
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'email') {
      sessionStorage.setItem('pendingAuthEmail', value);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formState.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formState.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      const response = await authService.requestOtp({ email: formState.email });
      if (response.success) {
        setCountdown(response.remainingTime || 60);
        toast({
          title: 'OTP Resent Successfully',
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
        title: 'Resend Throttled',
        description: error.message,
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetAuthFlow = () => {
    setIsOtpStage(false);
    setOtp('');
    sessionStorage.removeItem('isOtpStage');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOtpStage) {
      if (!validateForm()) return;
      setIsLoading(true);
      try {
        const response = await authService.login(formState);
        
        if (response.requiresOtp) {
          setIsOtpStage(true);
          sessionStorage.setItem('isOtpStage', 'true');
          setCountdown(60);
          toast({
            title: 'OTP Sent',
            description: response.message,
            status: 'success',
            duration: 5000,
            isClosable: true,
            position: 'top-right'
          });
        }
      } catch (error) {
        toast({
          title: 'Login Error',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // OTP Verification Stage
      if (!otp || otp.length < 6) {
        toast({
          title: 'Invalid OTP',
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
        const response = await authService.verifyLoginOtp({
          email: formState.email,
          verificationCode: otp
        });

        if (response.success) {
          Auth.login(response.token);
          sessionStorage.clear(); // Clear flow state
          toast({
            title: 'Login Successful! 👋',
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
          title: 'Verification Failed',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
      <Flex p={{ base: 4, md: 8 }} flex={1} align={'center'} justify={'center'} bg={bgImageOverlay}>
        <Stack spacing={8} w={'full'} maxW={'md'} px={6}>
          <Stack align="center" spacing={4}>
            <Image src={FoodLogo} alt="logo" h="80px" borderRadius="full" />
            <Heading fontSize={'3xl'} fontWeight="bold" textAlign="center">
              {isOtpStage ? 'Verify your identity' : 'Sign in to your account'}
            </Heading>
            <Text fontSize={'lg'} color={'gray.500'} textAlign="center">
              {isOtpStage 
                ? `Enter the code sent to ${formState.email}`
                : 'Welcome back to Food Bank System'}
            </Text>
          </Stack>

          <Box bg={cardBg} rounded={'xl'} boxShadow={'lg'} p={8} border="1px" borderColor={borderColor}>
            <form onSubmit={handleSubmit} noValidate>
              <Stack spacing={4}>
                {!isOtpStage ? (
                  <>
                    <FormControl id="email" isRequired isInvalid={!!errors.email}>
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

                    <FormControl id="password" isRequired isInvalid={!!errors.password}>
                      <FormLabel fontWeight="600">Password</FormLabel>
                      <Input 
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        value={formState.password}
                        onChange={handleChange}
                        size="lg"
                        borderRadius="md"
                      />
                      <FormErrorMessage>{errors.password}</FormErrorMessage>
                    </FormControl>
                  </>
                ) : (
                  <FormControl id="otp" isRequired>
                    <FormLabel fontWeight="600">Verification Code</FormLabel>
                    <Input 
                      type="text"
                      name="otp"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      size="lg"
                      borderRadius="md"
                      placeholder="6-digit code"
                      maxLength={6}
                      textAlign="center"
                      fontSize="2xl"
                      letterSpacing="0.5em"
                    />
                    <Flex justify="space-between" align="center" mt={2}>
                      <Text fontSize="sm" color="gray.500">
                        {canResend ? (
                          <Link color="brand.500" fontWeight="bold" onClick={handleResendOtp}>
                            Resend Code
                          </Link>
                        ) : (
                          `Resend in ${countdown}s`
                        )}
                      </Text>
                      <Link fontSize="sm" color="brand.500" onClick={resetAuthFlow}>
                        Back to Login
                      </Link>
                    </Flex>
                  </FormControl>
                )}

                <Stack spacing={6} mt={4}>
                  <Button 
                    size="lg"
                    bg={'brand.500'} 
                    color={'white'} 
                    type="submit"
                    isLoading={isLoading}
                    loadingText={isOtpStage ? 'Verifying...' : 'Signing in...'}
                    _hover={{ bg: 'brand.600' }}
                    boxShadow="md"
                  >
                    {isOtpStage ? 'Verify & Login' : 'Continue'}
                  </Button>
                </Stack>
              </Stack>
            </form>
          </Box>

          <Box textAlign="center">
            <Text color="gray.500">
              New to us?{" "}
              <Link color="brand.500" fontWeight="bold" as={ReactRouterLink} to='/register'>
                Sign Up
              </Link>
            </Text>
          </Box>
        </Stack>
      </Flex>

      <Flex flex={1} display={{ base: 'none', md: 'flex' }} position="relative">
        <Image
          src={FoodPlate}
          alt={'Login Image'}
          objectFit={'cover'}
          w="full"
          h="full"
          fallbackSrc="https://images.unsplash.com/photo-1593113565694-c6f14006c04f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
        />
        <Box position="absolute" top={0} left={0} w="full" h="full" bgGradient="linear(to-r, blackAlpha.600, transparent)" />
      </Flex>
    </Stack>
  );
};

export default Login;