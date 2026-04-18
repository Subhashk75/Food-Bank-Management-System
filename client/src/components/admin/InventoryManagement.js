import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Image,
  IconButton,
  SimpleGrid,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  useToast,
  Center,
  Alert,
  AlertIcon,
  Skeleton,
  Heading,
  Divider,
  Badge
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa';
import { MdOutlineModeEdit, MdAdd } from 'react-icons/md';
import { productService } from '../utils/api';
import Auth from '../utils/auth';
import placeholderProduct from '../../assets/placeholder-product.png';

function InventoryManagement() {
  const bg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerCol = useColorModeValue('gray.800', 'white');
  const toast = useToast();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }
    fetchProducts();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productService.getAll();
      if (response.success || response.data) {
        setProducts(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (err) {
      setError(err.message);
      showErrorToast('Failed to fetch products', err.message);
    } finally {
      setLoading(false);
    }
  };

  const showErrorToast = (title, description) => {
    toast({
      title,
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const showSuccessToast = (title, description) => {
    toast({
      title,
      description,
      status: 'success',
      duration: 3000,
      isClosable: true,
      position: 'top-right'
    });
  };

  const handleDelete = async (productId) => {
    if (!productId) {
      showErrorToast('Error', 'Invalid product ID');
      return;
    }

    try {
      setIsDeleting(true);
      const response = await productService.delete(productId);
      
      if (response.success) {
        setProducts(prev => prev.filter(product => product._id !== productId));
        showSuccessToast('Success', 'Product deleted successfully');
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (err) {
      showErrorToast('Error', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const renderLoadingState = () => (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <Box key={i} p={4} bg={bg} borderRadius="xl" shadow="sm" border="1px" borderColor={borderColor}>
          <Skeleton height="150px" borderRadius="md" mb={4} />
          <Skeleton height="20px" width="70%" mb={2} />
          <Skeleton height="20px" width="40%" mb={4} />
          <HStack>
            <Skeleton height="32px" width="80px" />
            <Skeleton height="32px" width="32px" />
          </HStack>
        </Box>
      ))}
    </SimpleGrid>
  );

  const renderErrorState = () => (
    <Center py={10}>
      <Alert status="error" borderRadius="md" maxW="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Error loading products</Text>
          <Text>{error}</Text>
          <Button mt={3} colorScheme="red" onClick={fetchProducts}>
            Retry
          </Button>
        </Box>
      </Alert>
    </Center>
  );

  const renderEmptyState = () => (
    <Center h="300px" flexDirection="column" bg={bg} borderRadius="xl" border="1px dashed" borderColor={borderColor}>
      <Text fontSize="lg" color="gray.500" mb={4}>No products found in inventory</Text>
      <Button as={Link} to="/additem" colorScheme="brand" leftIcon={<MdAdd />}>
        Add Your First Product
      </Button>
    </Center>
  );

  const renderProductCard = (product) => (
    <Box 
      key={product._id} 
      p={5} 
      bg={bg} 
      borderRadius="xl" 
      shadow="sm" 
      border="1px" 
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{ shadow: 'md', transform: 'translateY(-2px)' }}
    >
      <VStack spacing={4} align="stretch">
        <Box position="relative">
          <Image 
            src={product.image || placeholderProduct} 
            alt={product.name} 
            w="100%"
            h="160px"
            objectFit="cover" 
            borderRadius="md"
            fallbackSrc={placeholderProduct}
          />
          <Badge position="absolute" top={2} right={2} colorScheme={product.quantity > 10 ? 'green' : 'red'}>
            {product.quantity || 0} in stock
          </Badge>
        </Box>
        
        <Box>
          <Text fontSize="lg" fontWeight="bold" noOfLines={1} title={product.name}>{product.name}</Text>
          <Text fontSize="sm" color="gray.500" noOfLines={2} mt={1} h="40px">
            {product.description || 'No description available'}
          </Text>
        </Box>
        
        <Divider />

        <HStack justify="space-between">
          <Button 
            as={Link} 
            to={`/modifyitem/${product._id}`} 
            leftIcon={<MdOutlineModeEdit />} 
            colorScheme="brand"
            variant="outline"
            size="sm"
            flex={1}
            isLoading={isDeleting}
          >
            Edit
          </Button>
          <IconButton 
            aria-label={`Delete ${product.name}`}
            icon={<FaTrash />}
            colorScheme="red"
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(product._id)}
            isLoading={isDeleting}
            isDisabled={isDeleting}
          />
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={4}>
        <Heading size="lg" color={headerCol}>
          Inventory Management
        </Heading>
        <Button 
          as={Link} 
          to="/additem" 
          colorScheme="brand" 
          leftIcon={<MdAdd />}
          shadow="sm"
        >
          Add New Item
        </Button>
      </Flex>

      {loading ? renderLoadingState() : 
       error ? renderErrorState() : 
       products.length === 0 ? renderEmptyState() : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} spacing={6}>
          {products.map(renderProductCard)}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default InventoryManagement;