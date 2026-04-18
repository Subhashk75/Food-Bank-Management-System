import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Stat,
  Text,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  Skeleton,
  SkeletonText,
  Badge,
  Icon,
  Heading,
  HStack,
  Stack,
  Button
} from "@chakra-ui/react";
import { MdCallMade, MdCallReceived, MdShoppingCart, MdCategory, MdLocalShipping } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Auth from "../utils/auth";
import { inventoryService, productService, categoryService, transactionService } from "../utils/api";

function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const borderColor = useColorModeValue('gray.100', 'gray.600');
  const headerTextCol = useColorModeValue('gray.800', 'white');
  const theadBg = useColorModeValue('gray.50', 'gray.800');
  const hoverBg = useColorModeValue('gray.50', 'gray.600');

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }
  }, [navigate]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const results = await Promise.allSettled([
          transactionService.getAll(),
          productService.getAll(),
          categoryService.getAll(),
          inventoryService.getAll()
        ]);

        const [transactionsData, productsData, categoriesData, inventoryData] = results;

        if (isMounted) {
          setTransactions(transactionsData.status === 'fulfilled' ? transactionsData.value.data : []);
          setProducts(productsData.status === 'fulfilled' ? productsData.value.data : []);
          setCategories(categoriesData.status === 'fulfilled' ? categoriesData.value.data : []);
          setInventory(inventoryData.status === 'fulfilled' ? inventoryData.value.data.inventory : []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch data');
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalQuantity = Array.isArray(inventory)
    ? inventory.reduce((sum, item) => sum + (item.quantity || 0), 0)
    : 0;

  if (error) return (
    <Box p={5} bg="red.50" color="red.500" borderRadius="md">
      Error: {error}
    </Box>
  );

  return (
    <Box>
      <Heading size="lg" mb={6} color={headerTextCol}>
        Dashboard Overview
      </Heading>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, xl: 6 }} mb={8}>
        {/* Stat Card 1 */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor={borderColor}>
          {loading ? <SkeletonText mt='4' noOfLines={3} spacing='4' skeletonHeight='2' /> : (
            <Flex justify="space-between" align="center">
              <Stat>
                <StatLabel color={textColor} fontWeight="bold" fontSize="sm">Total Products</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="900">{totalProducts}</StatNumber>
                <StatHelpText color="green.500" mb={0}>
                  Available in inventory
                </StatHelpText>
              </Stat>
              <Flex w={12} h={12} bg="brand.100" color="brand.500" align="center" justify="center" borderRadius="full">
                <Icon as={MdShoppingCart} boxSize={6} />
              </Flex>
            </Flex>
          )}
        </Box>

        {/* Stat Card 2 */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor={borderColor}>
          {loading ? <SkeletonText mt='4' noOfLines={3} spacing='4' skeletonHeight='2' /> : (
            <Flex justify="space-between" align="center">
              <Stat>
                <StatLabel color={textColor} fontWeight="bold" fontSize="sm">Total Categories</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="900">{totalCategories}</StatNumber>
                <StatHelpText color="blue.500" mb={0}>
                  Product categories
                </StatHelpText>
              </Stat>
              <Flex w={12} h={12} bg="purple.100" color="purple.500" align="center" justify="center" borderRadius="full">
                <Icon as={MdCategory} boxSize={6} />
              </Flex>
            </Flex>
          )}
        </Box>

        {/* Stat Card 3 */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm" border="1px" borderColor={borderColor}>
          {loading ? <SkeletonText mt='4' noOfLines={3} spacing='4' skeletonHeight='2' /> : (
            <Flex justify="space-between" align="center">
              <Stat>
                <StatLabel color={textColor} fontWeight="bold" fontSize="sm">Total Quantity</StatLabel>
                <StatNumber fontSize="3xl" fontWeight="900">{totalQuantity}</StatNumber>
                <StatHelpText color="orange.500" mb={0}>
                  Total stock
                </StatHelpText>
              </Stat>
              <Flex w={12} h={12} bg="orange.100" color="orange.500" align="center" justify="center" borderRadius="full">
                <Icon as={MdLocalShipping} boxSize={6} />
              </Flex>
            </Flex>
          )}
        </Box>
      </SimpleGrid>

      <Box bg={cardBg} borderRadius="xl" boxShadow="sm" border="1px" borderColor={borderColor} overflow="hidden">
        <Box px={6} py={4} borderBottom="1px" borderColor={borderColor}>
          <Heading size="md">Recent Transactions</Heading>
        </Box>
        <Box overflowX="auto" p={4}>
          {loading ? (
            <Stack>
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </Stack>
          ) : transactions.length > 0 ? (
            <Table variant="simple">
              <Thead bg={theadBg}>
                <Tr>
                  <Th w="50px">Op.</Th>
                  <Th>Operation</Th>
                  <Th>Product</Th>
                  <Th isNumeric>Qty</Th>
                  <Th>Unit</Th>
                  <Th isNumeric>Total</Th>
                  <Th>Purpose</Th>
                  <Th>BatchSize</Th>
                  <Th>Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.map((transaction, index) => {
                  const product = transaction.product || {};
                  const total = transaction.quantity * (transaction.unit === 'kg' ? 1 : 1); // Logic replication from original

                  const isReceive = transaction.operation === "Receive";
                  return (
                    <Tr key={index} _hover={{ bg: hoverBg }}>
                      <Td>
                        {isReceive ? (
                          <Flex w={8} h={8} borderRadius="full" bg="green.100" color="green.600" align="center" justify="center">
                            <MdCallReceived />
                          </Flex>
                        ) : (
                          <Flex w={8} h={8} borderRadius="full" bg="red.100" color="red.600" align="center" justify="center">
                            <MdCallMade />
                          </Flex>
                        )}
                      </Td>
                      <Td>
                        <Badge colorScheme={isReceive ? "green" : "red"}>
                          {transaction.operation}
                        </Badge>
                      </Td>
                      <Td fontWeight="500">{product.name || "N/A"}</Td>
                      <Td isNumeric>{transaction.quantity}</Td>
                      <Td>{transaction.unit}</Td>
                      <Td isNumeric fontWeight="bold">{total}</Td>
                      <Td>{transaction.purpose}</Td>
                      <Td>{transaction.batchSize || "-"}</Td>
                      <Td color="gray.500">{new Date(transaction.createdAt).toLocaleDateString()}</Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <Flex justify="center" p={8} direction="column" align="center" color="gray.400">
              <Icon as={MdLocalShipping} boxSize={12} mb={4} />
              <Text>No transactions available</Text>
            </Flex>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;
