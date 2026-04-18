import React, { useState, useEffect } from 'react';
import {
  InputGroup,
  Input,
  Button,
  Box,
  List,
  ListItem,
  useColorModeValue,
  useToast,
  FormControl,
  Select,
  FormLabel,
  Text,
  Heading,
  Flex,
  Icon,
  Divider,
  SimpleGrid
} from '@chakra-ui/react';
import { MdSearch, MdOutlineEdit, MdSave } from 'react-icons/md';
import { productService, inventoryService } from '../components/utils/api';
import Auth from '../components/utils/auth';
import { useNavigate } from 'react-router-dom';

function ModifyItem() {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerTextCol = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('gray.50', 'gray.600');
  const dropdownBg = useColorModeValue('white', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const toast = useToast();
  const navigate = useNavigate();

  const [searchName, setSearchName] = useState('');
  const [inputValues, setInputValues] = useState({
    id: '',
    name: '',
    quantity: ''
  });

  const [transactionInfo, setTransactionInfo] = useState({
    unit: '',
    purpose: '',
    batchSize: ''
  });

  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productService.getAll();
        setProducts(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch products',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate, toast]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchName(value);
    const filtered = products.filter(p => p.name.toLowerCase().includes(value.toLowerCase()));
    setSuggestions(filtered);
  };

  const handleSuggestionClick = (product) => {
    setInputValues({
      id: product._id,
      name: product.name,
      quantity: ''
    });
    setSearchName(product.name);
    setSuggestions([]);
  };

  const handleModifyItem = async () => {
    const { id, name, quantity } = inputValues;
    const { unit, purpose, batchSize } = transactionInfo;

    if (!id || !name || !quantity || !unit || !purpose) {
      toast({
        title: 'Error',
        description: 'All required fields must be filled',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setUpdating(true);
      const payload = {
        productId: id,
        quantity: parseInt(quantity),
        unit,
        purpose,
        batchSize
      };

      await inventoryService.create(payload);

      toast({
        title: 'Success',
        description: `Inventory updated successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setInputValues({ id: '', name: '', quantity: '' });
      setTransactionInfo({ unit: '', purpose: '', batchSize: '' });
      setSearchName('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Inventory update failed',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6} color={headerTextCol}>
        Modify Product Inventory
      </Heading>

      <Box 
        bg={cardBg} 
        borderRadius="xl" 
        shadow="sm" 
        border="1px" 
        borderColor={borderColor} 
        p={8} 
        maxW="800px" 
        mx="auto"
      >
        <Heading size="md" mb={6} display="flex" alignItems="center">
          <Icon as={MdOutlineEdit} mr={2} color="brand.500" />
          Update Stock details
        </Heading>

        <Box position="relative" mb={8}>
          <FormControl>
            <FormLabel fontWeight="600">Search Product</FormLabel>
            <Flex align="center" bg={inputBg} borderRadius="md" px={3} border="1px" borderColor={borderColor}>
              <Icon as={MdSearch} color="gray.400" />
              <Input
                variant="unstyled"
                px={2}
                py={2}
                placeholder="Product name"
                value={searchName}
                onChange={handleSearchChange}
                isDisabled={loading}
              />
            </Flex>
          </FormControl>

          {suggestions.length > 0 && searchName && (
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
                    cursor="pointer"
                    onClick={() => handleSuggestionClick(product)}
                  >
                    {product.name}
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Box>

        {inputValues.id && (
          <Box mt={4} animation="fade-in 0.3s">
            <Text fontWeight="bold" mb={4} fontSize="lg" color="brand.600">Selected Product: {inputValues.name}</Text>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              <FormControl isRequired>
                <FormLabel fontWeight="600">Quantity to Add</FormLabel>
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 50"
                  value={inputValues.quantity}
                  onChange={(e) => setInputValues({ ...inputValues, quantity: e.target.value })}
                  bg={inputBg}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600">Unit</FormLabel>
                <Select
                  placeholder="Select unit"
                  value={transactionInfo.unit}
                  onChange={(e) => setTransactionInfo({ ...transactionInfo, unit: e.target.value })}
                  bg={inputBg}
                >
                  <option value="pcs">pcs</option>
                  <option value="kg">kg</option>
                  <option value="g">g</option>
                  <option value="l">l</option>
                  <option value="ml">ml</option>
                  <option value="box">box</option>
                  <option value="pack">pack</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="600">Purpose</FormLabel>
                <Input
                  placeholder="e.g. Donated by NGO"
                  value={transactionInfo.purpose}
                  onChange={(e) => setTransactionInfo({ ...transactionInfo, purpose: e.target.value })}
                  bg={inputBg}
                />
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="600">Batch Size</FormLabel>
                <Input
                  placeholder="Optional"
                  value={transactionInfo.batchSize}
                  onChange={(e) => setTransactionInfo({ ...transactionInfo, batchSize: e.target.value })}
                  bg={inputBg}
                />
              </FormControl>
            </SimpleGrid>

            <Divider my={6} />

            <Button
              size="lg"
              colorScheme="brand"
              isLoading={updating}
              onClick={handleModifyItem}
              leftIcon={<MdSave />}
              width="full"
            >
              Record Receipt
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default ModifyItem;
