import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  HStack,
  Text,
  useToast,
  Heading,
  useColorModeValue,
  Divider,
  Icon,
  SimpleGrid,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Center
} from '@chakra-ui/react';
import { MdAdd, MdLocalShipping, MdDelete, MdHistory, MdAssignment } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { productService, transactionService } from '../utils/api';
import Auth from '../utils/auth';

const Distribution = () => {
  const [products, setProducts] = useState([]);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [purpose, setPurpose] = useState('');
  const [batchSize, setBatchSize] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const toast = useToast();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerCol = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('gray.50', 'gray.600');
  const listItemBg = useColorModeValue('gray.50', 'gray.600');
  const summaryBg = useColorModeValue('green.50', 'gray.800');

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }
    const fetchProducts = async () => {
      try {
        const res = await productService.getAll();
        setProductOptions(res.data);
      } catch (err) {
        console.error('Failed to load products', err);
      }
    };
    fetchProducts();
  }, [navigate]);

  const handleAddProduct = () => {
    if (!selectedProductId || !quantity) {
      toast({
        title: 'Missing fields',
        description: 'Please select a product and enter quantity.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const selectedProduct = productOptions.find(
      (p) => p._id === selectedProductId
    );

    setProducts((prev) => [
      ...prev,
      {
        _id: selectedProduct._id,
        name: selectedProduct.name,
        quantity,
        available: selectedProduct.quantity
      },
    ]);
    setSelectedProductId('');
    setQuantity('');
  };

  const handleRemoveProduct = (indexToRemove) => {
    setProducts(products.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDistribute = async () => {
    if (!unit || !purpose || products.length === 0) {
      toast({
        title: 'Missing input',
        description: 'Please complete all required fields and add at least one product.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        items: products.map(p => ({
          productId: p._id,
          name: p.name,
          quantity: Number(p.quantity)
        })),
        unit,
        distributedTo: purpose,
        batchSize,
        operation: 'Distribute',
      };

      await transactionService.create(payload);

      toast({
        title: 'Distribution Successful',
        description: `Successfully distributed ${products.length} types of products to ${purpose}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      setProducts([]);
      setUnit('');
      setPurpose('');
      setBatchSize('');
      onClose(); // Close the modal on success
      navigate('/dashboard');
    } catch (err) {
      toast({
        title: 'Distribution Failed',
        description: err.message || 'An error occurred during distribution.',
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
      <Flex justify="space-between" align="center" mb={8}>
        <VStack align="start" spacing={1}>
          <Heading size="lg" color={headerCol}>
            Distribution Hub
          </Heading>
          <Text color="gray.500" fontSize="sm">Manage and track outgoing inventory deliveries</Text>
        </VStack>
        <Button
          colorScheme="brand"
          size="lg"
          leftIcon={<MdLocalShipping />}
          onClick={onOpen}
          boxShadow="md"
          px={8}
        >
          Perform Distribution
        </Button>
      </Flex>

      {/* Main Page View - Placeholder or Stats when Modal is closed */}
      <Box p={10} bg={cardBg} borderRadius="2xl" border="2px dashed" borderColor={borderColor}>
        <Center flexDirection="column" py={20}>
          <Icon as={MdAssignment} w={16} h={16} color="gray.300" mb={4} />
          <Heading size="md" color="gray.400" mb={2}>No Active Distribution Session</Heading>
          <Text color="gray.500" mb={6}>Click the button above to start a new distribution operation</Text>
          <Button variant="outline" colorScheme="gray" leftIcon={<MdHistory />} onClick={() => navigate('/output')}>
            View History
          </Button>
        </Center>
      </Box>

      {/* Perform Distribution Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
        <ModalOverlay backdropFilter="blur(5px)" bg="blackAlpha.600" />
        <ModalContent borderRadius="2xl">
          <ModalHeader borderBottom="1px" borderColor={borderColor} py={6}>
            <HStack spacing={3}>
              <Icon as={MdLocalShipping} w={6} h={6} color="brand.500" />
              <Text>Execute New Distribution</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton mt={4} />
          
          <ModalBody p={8}>
            <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={10}>
              {/* Left Column - Product List & Selection */}
              <VStack spacing={6} align="stretch">
                <Box bg={listItemBg} p={6} borderRadius="xl" border="1px" borderColor={borderColor}>
                  <Heading size="sm" mb={4} color="gray.600">Step 1: Select Products</Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">Product</FormLabel>
                      <Select
                        placeholder="Select item"
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        bg={cardBg}
                        focusBorderColor="brand.400"
                      >
                        {productOptions.map((product) => (
                          <option key={product._id} value={product._id} disabled={products.some(p => p._id === product._id)}>
                            {product.name} (Stock: {product.quantity})
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">Quantity</FormLabel>
                      <HStack>
                        <Input
                          type="number"
                          min="1"
                          placeholder="qty"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          bg={cardBg}
                          focusBorderColor="brand.400"
                        />
                        <Button 
                          onClick={handleAddProduct} 
                          colorScheme="brand" 
                          px={8}
                          isDisabled={!selectedProductId || !quantity}
                        >
                          Add
                        </Button>
                      </HStack>
                    </FormControl>
                  </SimpleGrid>
                </Box>

                <Box flex={1}>
                  <Heading size="sm" mb={4} color="gray.600">Selected Items</Heading>
                  {products.length === 0 ? (
                    <Center p={10} border="1px dashed" borderColor={borderColor} borderRadius="xl">
                      <Text color="gray.400" fontSize="smitalic">No items added to current session</Text>
                    </Center>
                  ) : (
                    <Box overflowX="auto" border="1px" borderColor={borderColor} borderRadius="xl">
                      <Table variant="simple" size="sm">
                        <Thead bg={listItemBg}>
                          <Tr>
                            <Th>Product</Th>
                            <Th isNumeric>In Stock</Th>
                            <Th isNumeric>Distribute</Th>
                            <Th textAlign="center">Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {products.map((p, idx) => (
                            <Tr key={idx}>
                              <Td fontWeight="600">{p.name}</Td>
                              <Td isNumeric>
                                <Badge variant="subtle" colorScheme={p.available < 10 ? 'red' : 'gray'}>
                                  {p.available}
                                </Badge>
                              </Td>
                              <Td isNumeric>
                                <Badge colorScheme="blue" variant="solid" px={2} borderRadius="md">
                                  {p.quantity}
                                </Badge>
                              </Td>
                              <Td textAlign="center">
                                <Button size="xs" variant="ghost" colorScheme="red" onClick={() => handleRemoveProduct(idx)}>
                                  <Icon as={MdDelete} />
                                </Button>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  )}
                </Box>
              </VStack>

              {/* Right Column - Distribution Meta & Summary */}
              <VStack spacing={6} align="stretch">
                 <Box bg={useColorModeValue('gray.50', 'gray.600')} p={6} borderRadius="xl" border="1px" borderColor={borderColor}>
                  <Heading size="sm" mb={4} color="gray.600">Step 2: Delivery Details</Heading>
                  <VStack spacing={4}>
                    <FormControl isRequired>
                      <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">Distribution Unit</FormLabel>
                      <Select
                        placeholder="Select Unit"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        bg={cardBg}
                        focusBorderColor="green.400"
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
                      <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">Distributed To</FormLabel>
                      <Input
                        placeholder="e.g. Community Center A"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        bg={cardBg}
                        focusBorderColor="green.400"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="xs" fontWeight="bold" textTransform="uppercase">Reference / Batch</FormLabel>
                      <Input
                        placeholder="Optional batch name"
                        value={batchSize}
                        onChange={(e) => setBatchSize(e.target.value)}
                        bg={cardBg}
                        focusBorderColor="green.400"
                      />
                    </FormControl>
                  </VStack>
                </Box>

                <Box bg={summaryBg} p={6} borderRadius="xl" border="1px dashed" borderColor="green.300">
                  <Heading size="xs" mb={4} textTransform="uppercase" color="green.600" letterSpacing="wider">Distribution Summary</Heading>
                  <VStack spacing={3} align="stretch">
                    <Flex justify="space-between">
                      <Text color="gray.500" fontSize="sm">Unique Products:</Text>
                      <Text fontWeight="bold">{products.length}</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.500" fontSize="sm">Total Units:</Text>
                      <Text fontWeight="bold">{products.reduce((acc, curr) => acc + Number(curr.quantity), 0)} {unit}</Text>
                    </Flex>
                    <Divider borderColor="green.200" />
                    <Flex justify="space-between">
                      <Text color="gray.500" fontSize="sm">Destination:</Text>
                      <Text fontWeight="bold" color="green.700">{purpose || 'Not set'}</Text>
                    </Flex>
                  </VStack>
                </Box>
              </VStack>
            </SimpleGrid>
          </ModalBody>

          <ModalFooter borderTop="1px" borderColor={borderColor} p={6}>
            <Button variant="ghost" mr={3} onClick={onClose} isDisabled={isLoading}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              size="lg"
              px={12}
              leftIcon={<MdLocalShipping />}
              onClick={handleDistribute}
              isLoading={isLoading}
              loadingText="Distributing..."
              isDisabled={products.length === 0 || !unit || !purpose}
              boxShadow="0 4px 14px 0 rgba(72, 187, 120, 0.39)"
            >
              Confirm & Execute Distribution
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Distribution;
