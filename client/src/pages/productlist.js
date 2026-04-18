import React, { useEffect, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Button,
  Flex,
  Box,
  useColorModeValue,
  useToast,
  IconButton,
  Heading,
  Icon,
  Badge,
  HStack,
  Skeleton
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { MdAdd } from 'react-icons/md';
import { productService } from '../components/utils/api';
import Auth from '../components/utils/auth';

const ProductList = () => {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerTextCol = useColorModeValue('gray.800', 'white');
  const theadBg = useColorModeValue('gray.50', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');
  const toast = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
      return;
    }

    const fetchProducts = async () => {
      try {
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

  const handleDelete = async (productId) => {
    try {
      setDeletingId(productId);
      await productService.delete(productId);
      
      setProducts(products.filter((product) => product._id !== productId));
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg" color={headerTextCol}>
          Product List
        </Heading>
        <Button 
          as={Link} 
          to="/additem" 
          colorScheme="brand" 
          leftIcon={<MdAdd />}
        >
          Add Product
        </Button>
      </Flex>

      <Box 
        bg={cardBg} 
        borderRadius="xl" 
        shadow="sm" 
        border="1px" 
        borderColor={borderColor}
        overflow="hidden"
      >
        <TableContainer>
          <Table variant="simple">
            <Thead bg={theadBg}>
              <Tr>
                <Th>Name</Th>
                <Th>Quantity</Th>
                <Th>Description</Th>
                <Th>Category</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                // Skeleton loading rows
                Array.from({ length: 5 }).map((_, i) => (
                  <Tr key={i}>
                    <Td><Skeleton height="20px" width="100px" /></Td>
                    <Td><Skeleton height="20px" width="50px" /></Td>
                    <Td><Skeleton height="20px" width="200px" /></Td>
                    <Td><Skeleton height="20px" width="80px" /></Td>
                    <Td><Skeleton height="32px" width="100px" float="right" /></Td>
                  </Tr>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <Tr key={product._id} _hover={{ bg: hoverBg }}>
                    <Td fontWeight="500">{product.name}</Td>
                    <Td>
                      <Badge colorScheme={product.quantity > 10 ? 'green' : 'red'}>
                        {product.quantity}
                      </Badge>
                    </Td>
                    <Td color="gray.500" maxW="300px" isTruncated>{product.description || '-'}</Td>
                    <Td>{product.category?.name || '-'}</Td>
                    <Td>
                      <HStack justify="flex-end" spacing={2}>
                        <Button
                          as={Link}
                          to={`/modifyitem/${product._id}`}
                          state={{ productId: product._id }}
                          size="sm"
                          colorScheme="brand"
                          variant="ghost"
                          leftIcon={<FaEdit />}
                        >
                          Edit
                        </Button>
                        <IconButton
                          aria-label="Delete product"
                          icon={<FaTrash />}
                          colorScheme="red"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          isLoading={deletingId === product._id}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={8} color="gray.500">
                    No products found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default ProductList;