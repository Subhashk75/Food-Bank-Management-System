import React, { useState, useEffect } from 'react';
import { 
  Input, 
  Button, 
  Box, 
  List, 
  ListItem, 
  useColorModeValue,
  useToast,
  Text,
  Heading,
  FormControl,
  FormLabel,
  Flex,
  Icon
} from '@chakra-ui/react';
import { MdCallMade, MdSearch } from 'react-icons/md';
import { productService } from '../utils/api';
import Auth from '../utils/auth';
import { useNavigate } from 'react-router-dom';

function RegisterProductOutput() {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerTextCol = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('gray.50', 'gray.600');
  const dropdownBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  
  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState('');
  const [outputQuantity, setOutputQuantity] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }

    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        setSuggestions(response.data || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch products',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchProducts();
  }, [navigate, toast]);

  const handleProductNameChange = async (e) => {
    const value = e.target.value;
    setProductName(value);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await productService.search(value);
      setSuggestions(response.data || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to search products',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (product) => {
    setProductName(product.name);
    setProductId(product._id);
    setSuggestions([]);
  };

  const handleSubtractQuantity = async () => {
    if (!productName || !outputQuantity || !productId) {
      toast({
        title: 'Error',
        description: 'Please select a product and enter quantity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await productService.updateQuantity(
        productId,
        {
          quantity: parseInt(outputQuantity),
          operation: 'subtract'
        }
      );

      toast({
        title: 'Success',
        description: 'Product quantity updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setProductName('');
      setProductId('');
      setOutputQuantity('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update product quantity',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6} color={headerTextCol}>
        Record Spoilage / Output
      </Heading>

      <Box 
        bg={cardBg} 
        borderRadius="xl" 
        shadow="sm" 
        border="1px" 
        borderColor={borderColor} 
        p={8} 
        maxW="600px" 
        mx="auto"
      >
        <Heading size="md" mb={6} display="flex" alignItems="center">
          <Icon as={MdCallMade} mr={2} color="red.500" />
          Deduct Stock Quantity
        </Heading>
        
        <Box position="relative" mb={4}>
          <FormControl>
            <FormLabel fontWeight="600">Target Product</FormLabel>
            <Flex align="center" bg={inputBg} borderRadius="md" px={3} border="1px" borderColor={borderColor}>
              <Icon as={MdSearch} color="gray.400" />
              <Input
                variant="unstyled"
                px={2}
                py={2}
                placeholder="Search product..."
                value={productName}
                onChange={handleProductNameChange}
              />
            </Flex>
          </FormControl>

          {suggestions?.length > 0 && productName && (
            <Box 
              position="absolute" 
              top="100%" 
              left={0} 
              right={0} 
              zIndex={10} 
              bg={dropdownBg}
              border="1px" 
              borderColor={borderColor} 
              borderRadius="md" 
              maxH="200px" 
              overflowY="auto" 
              shadow="md"
            >
              <List>
                {suggestions.map((product) => (
                  <ListItem 
                    key={product._id} 
                    p={3} 
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleSuggestionClick(product)}
                    cursor="pointer"
                    display="flex"
                    justifyContent="space-between"
                  >
                    <Text fontWeight="500">{product.name}</Text>
                    <Text color="gray.500" fontSize="sm">Stock: {product.quantity}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        <FormControl mb={6}>
          <FormLabel fontWeight="600">Output Quantity</FormLabel>
          <Input
            placeholder="e.g. 5"
            value={outputQuantity}
            onChange={(e) => setOutputQuantity(e.target.value)}
            type="number"
            min="1"
            bg={inputBg}
          />
        </FormControl>

        <Button 
          onClick={handleSubtractQuantity} 
          colorScheme="red"
          size="lg"
          isLoading={isLoading}
          loadingText="Processing..."
          width="full"
        >
          Record Output 
        </Button>
      </Box>
    </Box>
  );
}

export default RegisterProductOutput;