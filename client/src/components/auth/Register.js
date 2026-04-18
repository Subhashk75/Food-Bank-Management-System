'use client';
import {
  Flex, Box, FormControl, FormLabel, Input, Stack, Button,
  Heading, Text, Link, useToast, useColorModeValue, Select
} from '@chakra-ui/react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_BASE } from '../../components/utils/api';
import Auth from '../../components/utils/auth';
import axios from "axios";

export default function SignupCard() {
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    role: 'volunteer',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [otpPhase, setOtpPhase] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const bgImageOverlay = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    if (Auth.loggedIn()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetOtp = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE}/user/getOtp`,
        { email: formState.email },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data.success) {
        setOtpPhase(true);
        toast({
          title: 'OTP sent to your email',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      toast({
        title: 'Error',
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

  setIsLoading(true);
  try {
    const payload = {
      ...formState,
      verificationCode,
    };

    const response = await axios.post(
      `${API_BASE}/user/register`,
      payload,
      { withCredentials: true }
    );
     
    if (response.data.success) {
      Auth.login(response.data.token);
      
      // ✅ Save user role to localStorage
      localStorage.setItem('userRole', response?.data?.role || formState.role);

      toast({
        title: 'Account verified and logged in!',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top-right'
      });
      navigate('/dashboard');
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    toast({
      title: 'Verification failed',
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
          <Heading fontSize={'3xl'} fontWeight="extrabold">Create an account</Heading>
          <Text fontSize={'lg'} color={'gray.500'}>
            To start helping the community ✌️
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
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl id="username" isRequired isDisabled={otpPhase}>
                <FormLabel fontWeight="600">Username</FormLabel>
                <Input
                  type="text"
                  name="username"
                  value={formState.username}
                  onChange={handleChange}
                  size="lg"
                  borderRadius="md"
                />
              </FormControl>

              <FormControl id="email" isRequired isDisabled={otpPhase}>
                <FormLabel fontWeight="600">Email address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formState.email}
                  onChange={handleChange}
                  size="lg"
                  borderRadius="md"
                />
              </FormControl>

              <FormControl id="password" isRequired isDisabled={otpPhase}>
                <FormLabel fontWeight="600">Password</FormLabel>
                <Input
                  type="password"
                  name="password"
                  value={formState.password}
                  onChange={handleChange}
                  size="lg"
                  borderRadius="md"
                />
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
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    size="lg"
                    borderRadius="md"
                    placeholder="Enter code from email"
                  />
                </FormControl>
              )}

              <Stack spacing={10} pt={4}>
                <Button
                  size="lg"
                  bg={'brand.500'}
                  color={'white'}
                  type="submit"
                  isLoading={isLoading}
                  loadingText={otpPhase ? 'Verifying OTP...' : 'Sending OTP...'}
                  _hover={{ bg: 'brand.600' }}
                  boxShadow="md"
                >
                  {otpPhase ? 'Submit OTP & Sign Up' : 'Get OTP'}
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
