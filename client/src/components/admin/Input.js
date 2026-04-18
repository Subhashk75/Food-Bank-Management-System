import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Flex, 
  Input, 
  Button, 
  Text, 
  List, 
  ListItem, 
  useColorModeValue,
  useToast,
  Heading,
  SimpleGrid,
  FormControl,
  FormLabel,
  Icon,
  Badge,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { MdAdd, MdCallReceived, MdDelete, MdSearch } from 'react-icons/md';
import { useNavigate } from "react-router-dom";
import { productService, inventoryService } from '../utils/api';
import Auth from '../utils/auth';

function RegisterProductInput() {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerTextCol = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('gray.50', 'gray.600');
  const dropdownBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  
  const [products, setProducts] = useState([]);
  const [productName, setProductName] = useState('');
  const [productId, setProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [purpose, setPurpose] = useState('');
  const [batch, setBatch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAll();
        setSuggestions(response.data || []);
      } catch (err) {
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
  }, [toast, navigate]);

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
    }
  };

  const handleSuggestionClick = (product) => {
    setProductName(product.name);
    setProductId(product._id);
    setSuggestions([]);
  };

  const handleAddProduct = () => {
    if (!productName || !productQuantity || !productId) {
      toast({
        title: 'Error',
        description: 'Please fill all product fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setProducts([...products, { 
      name: productName, 
      quantity: parseInt(productQuantity), 
      _id: productId 
    }]);
    setProductName('');
    setProductQuantity('');
    setProductId('');
  };

  const handleRemoveProduct = (index) => {
    const newProducts = [...products];
    newProducts.splice(index, 1);
    setProducts(newProducts);
  };

  const handleReceive = async () => {
    if (products.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one product',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!purpose) {
      toast({
        title: 'Error',
        description: 'Please specify the purpose',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      await inventoryService.receive({
        products, 
        purpose,
        batch
      });
      toast({
        title: 'Success',
        description: 'Products received successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form
      setProducts([]);
      setProductName('');
      setProductQuantity('');
      setProductId('');
      setUnit('');
      setPurpose('');
      setBatch('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to receive products',
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
        Receive Stock (Inputs)
      </Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        {/* Left Side - Add Products */}
        <Box bg={cardBg} p={6} borderRadius="xl" shadow="sm" border="1px" borderColor={borderColor}>
          <Heading size="md" mb={4} display="flex" alignItems="center">
            <Icon as={MdAdd} mr={2} color="brand.500" />
            Add Products to Receipt
          </Heading>
          
          <Box position="relative">
            <FormControl mb={3}>
              <FormLabel fontWeight="600">Product Search</FormLabel>
              <Flex align="center" bg={inputBg} borderRadius="md" px={3} border="1px" borderColor={borderColor}>
                <Icon as={MdSearch} color="gray.400" />
                <Input
                  variant="unstyled"
                  px={2}
                  py={2}
                  placeholder="Type product name"
                  value={productName}
                  onChange={handleProductNameChange}
                />
              </Flex>
            </FormControl>
            
            {suggestions.length > 0 && (
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
                      alignItems="center"
                    >
                      <Text fontWeight="500">{product.name}</Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          <FormControl mb={4}>
            <FormLabel fontWeight="600">Quantity Receiving</FormLabel>
            <Input
              placeholder="e.g. 50"
              value={productQuantity}
              onChange={(e) => setProductQuantity(e.target.value)}
              type="number"
              min="1"
              bg={inputBg}
            />
          </FormControl>
          
          <Button onClick={handleAddProduct} colorScheme="brand" rightIcon={<MdAdd />}>
            Add Product to List
          </Button>
          
          {products.length > 0 && (
            <Box mt={6} pt={4} borderTop="1px" borderColor={borderColor}>
              <Text fontWeight="bold" mb={3} color="gray.600">Items to Receive:</Text>
              <List spacing={3}>
                {products.map((product, index) => (
                  <ListItem 
                    key={index} 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center" 
                    bg={inputBg} 
                    p={3} 
                    borderRadius="md"
                  >
                    <Text fontWeight="500">{product.name}</Text>
                    <HStack>
                      <Badge colorScheme="green" px={2} py={1} borderRadius="md">Qty: {product.quantity}</Badge>
                      <Button size="sm" variant="ghost" colorScheme="red" onClick={() => handleRemoveProduct(index)}>
                        <Icon as={MdDelete} />
                      </Button>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {/* Right Side - Transaction Details */}
        <Box bg={cardBg} p={6} borderRadius="xl" shadow="sm" border="1px" borderColor={borderColor}>
          <Heading size="md" mb={4} display="flex" alignItems="center">
            <Icon as={MdCallReceived} mr={2} color="green.500" />
            Transaction Details
          </Heading>

          <FormControl mb={4}>
            <FormLabel fontWeight="600">Unit Type</FormLabel>
            <Input 
              placeholder="e.g. kg, pcs, boxes" 
              value={unit} 
              onChange={(e) => setUnit(e.target.value)} 
              bg={inputBg}
            />
          </FormControl>

          <FormControl mb={4}>
             <FormLabel fontWeight="600">Purpose</FormLabel>
             <Input 
               placeholder="e.g. Donation from XYZ" 
               value={purpose} 
               onChange={(e) => setPurpose(e.target.value)} 
               bg={inputBg}
             />
          </FormControl>

          <FormControl mb={6}>
            <FormLabel fontWeight="600">Batch Identifier</FormLabel>
            <Input 
              placeholder="Optional: Batch-001" 
              value={batch} 
              onChange={(e) => setBatch(e.target.value)} 
              bg={inputBg}
            />
          </FormControl>
          
          <Divider my={4} />

          <Button 
            onClick={handleReceive} 
            colorScheme="green"
            size="lg"
            width="full"
            isLoading={isLoading}
            loadingText="Processing..."
            isDisabled={products.length === 0}
          >
            Record Receipt
          </Button>
        </Box>
      </SimpleGrid>
    </Box>
  );
}

export default RegisterProductInput;