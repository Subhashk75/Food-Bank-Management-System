import React from 'react';
import { Box, Text, useColorModeValue, Heading, VStack } from '@chakra-ui/react';

function TermsOfService() {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headerColor = useColorModeValue('gray.800', 'white');

  return (
    <Box>
      <Heading size="lg" mb={6} color={headerColor}>
        Terms of Service
      </Heading>

      <Box bg={cardBg} borderRadius="xl" shadow="sm" border="1px" borderColor={borderColor} p={{ base: 6, md: 10 }}>
        <VStack spacing={6} align="stretch" maxW="800px">
          <Text fontSize="lg" color={textColor}>
            Welcome to FoodBank. These Terms of Service govern your use of our administrative and donor services. Please read these Terms carefully.
          </Text>

          <Box>
            <Heading as="h3" size="md" mb={2}>1. Acceptance of Terms</Heading>
            <Text color={textColor}>
              By accessing or using our services, you agree to be bound by these Terms and our Privacy Policy.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2}>2. Registration and Account Security</Heading>
            <Text color={textColor}>
              You must provide accurate information when creating an account. You are solely responsible for maintaining the security of your operational account.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2}>3. Donations and Payments</Heading>
            <Text color={textColor}>
              Donations made through our platform are subject to our Donation Policy. We utilize secure processors for financial transactions.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2}>4. Content and Conduct</Heading>
            <Text color={textColor}>
              You must comply with all applicable local and state laws and regulations while using our inventory and distribution services.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2}>5. Termination</Heading>
            <Text color={textColor}>
              We may terminate or suspend your access to our operational services at our sole discretion, without prior notice or liability, specifically concerning abuse of inventory management.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default TermsOfService;
