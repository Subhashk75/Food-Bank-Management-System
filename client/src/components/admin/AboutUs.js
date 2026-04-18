import React from 'react';
import { Box, Text, List, ListItem, Image, Container, Heading, useColorModeValue, SimpleGrid, Icon } from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md';

function AboutUs() {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headingColor = useColorModeValue('gray.800', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const subtextColor = useColorModeValue('gray.500', 'gray.400');
  
  return (
    <Box>
      <Heading size="lg" mb={6} color={headingColor}>
        About Us
      </Heading>

      <Box bg={cardBg} borderRadius="xl" shadow="sm" border="1px" borderColor={borderColor} p={8} overflow="hidden">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
          <Box>
            <Heading as='h2' size='xl' mb={4} color="brand.600">
              Food Bank System
            </Heading>
            <Text fontSize="lg" color={textColor} mb={6}>
              Welcome to FoodBank, a platform designed to streamline the process of receiving donations and managing food inventory and distribution for food banks.
            </Text>

            <Heading as='h3' size='md' mb={3}>Our Mission</Heading>
            <Text color={textColor} mb={8}>
              To provide an efficient and user-friendly solution for food banks, enabling them to focus on their core mission of feeding those in need rather than struggling with chaotic operational administration.
            </Text>

            <Heading as='h3' size='md' mb={4}>Key Features</Heading>
            <List spacing={3} mb={8}>
              {[
                'User registration and secure login.',
                'Admin tracking of all donations and reporting.',
                'Management of food inventory (add, update, delete).',
                'Logging receipt and distribution of items.',
                'Responsive and mobile-friendly design.',
              ].map((feature, idx) => (
                <ListItem key={idx} display="flex" alignItems="flex-start">
                  <Icon as={MdCheckCircle} color="brand.500" mt={1} mr={3} />
                  <Text color={textColor}>{feature}</Text>
                </ListItem>
              ))}
            </List>

            <Heading as='h3' size='md' mb={4}>Technologies Used</Heading>
            <List spacing={3} mb={8}>
              <ListItem fontSize='md'>• Modern React frontend via Chakra UI</ListItem>
              <ListItem fontSize='md'>• GraphQL with Node.js / Express.js</ListItem>
              <ListItem fontSize='md'>• MongoDB Database Management</ListItem>
            </List>
            
            <Text color={subtextColor} fontSize="sm">
              We are committed to supporting food banks and constantly enhancing our platform.
            </Text>
          </Box>

          <Box display="flex" justifyContent="center" alignItems="center">
            <Image
              src={'../../images/food.jpg'} 
              alt={'AboutUs Image'}
              objectFit={'cover'}
              borderRadius="xl"
              boxShadow="lg"
              maxH="500px"
              w="100%"
              fallbackSrc="https://images.unsplash.com/photo-1593113565694-c6f14006c04f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
            />
          </Box>
        </SimpleGrid>
      </Box>
    </Box>
  );
}

export default AboutUs;
