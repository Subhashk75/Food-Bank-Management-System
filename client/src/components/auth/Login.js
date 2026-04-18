'use client'
import { Button, Flex, Text, FormControl, FormLabel, Heading, Input, Stack, Image, Box, Link, useToast, Select, useColorModeValue } from '@chakra-ui/react';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../../components/utils/api';
import Auth from '../../components/utils/auth';
import FoodLogo from '../../assets/FoodLogo.jpg';
import FoodPlate from '../../assets/girl-apples.png';

const Login = () => {
  const [formState, setFormState] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const bgImageOverlay = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    if (Auth.loggedIn()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(formState);
      if (response.success) {
        Auth.login(response.token);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'top-right'
        });
        navigate('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      toast({
        title: 'Login failed',
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
    <Stack minH={'100vh'} direction={{ base: 'column', md: 'row' }}>
      <Flex p={{ base: 4, md: 8 }} flex={1} align={'center'} justify={'center'} bg={bgImageOverlay}>
        <Stack spacing={8} w={'full'} maxW={'md'} px={6}>
          <Stack align="center" spacing={4}>
            <Image src={FoodLogo} alt="logo" h="80px" borderRadius="full" />
            <Heading fontSize={'3xl'} fontWeight="bold" textAlign="center">
              Sign in to your account
            </Heading>
            <Text fontSize={'lg'} color={'gray.500'}>
              Welcome back to Food Bank System
            </Text>
          </Stack>

          <Box bg={cardBg} rounded={'xl'} boxShadow={'lg'} p={8} border="1px" borderColor={borderColor}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <FormControl id="email" isRequired>
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

                <FormControl id="password" isRequired>
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

                <Stack spacing={6} mt={4}>
                  <Button 
                    size="lg"
                    bg={'brand.500'} 
                    color={'white'} 
                    type="submit"
                    isLoading={isLoading}
                    loadingText="Signing in..."
                    _hover={{ bg: 'brand.600' }}
                    boxShadow="md"
                  >
                    Sign in
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