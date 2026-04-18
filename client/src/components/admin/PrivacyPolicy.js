import React from 'react';
import { Box, Text, useColorModeValue, Heading, VStack } from '@chakra-ui/react';

function PrivacyPolicy() {
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const headerColor = useColorModeValue('gray.800', 'white');

  return (
    <Box>
      <Heading size="lg" mb={6} color={headerColor}>
        Privacy Policy
      </Heading>

      <Box bg={cardBg} borderRadius="xl" shadow="sm" border="1px" borderColor={borderColor} p={{ base: 6, md: 10 }}>
        <VStack spacing={6} align="stretch" maxW="800px">
          <Text fontSize="lg" color={textColor}>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Food Bank platform.
          </Text>

          <Box>
            <Heading as="h3" size="md" mb={2}>1. Information Collection</Heading>
            <Text color={textColor}>
              We may collect personal information such as your name, email address, payment information, and other details you provide when registering or making a donation.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2}>2. Use of Information</Heading>
            <Text color={textColor}>
              We may use your information to process donations, send newsletters, respond to inquiries, and improve our platform functionality for volunteers and admins.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2}>3. Sharing of Information</Heading>
            <Text color={textColor}>
              We may share your information with third-party service providers, such as payment processors, as strictly necessary to provide our services.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2}>4. Security</Heading>
            <Text color={textColor}>
              We implement reasonable security measures to protect your administrative and donor information, although we cannot guarantee absolute internet security.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2}>5. Cookies and Tracking</Heading>
            <Text color={textColor}>
              We may use cookies and similar tracking technologies to analyze platform usage and improve our performance.
            </Text>
          </Box>

          <Box>
            <Heading as="h3" size="md" mb={2}>6. Changes to This Policy</Heading>
            <Text color={textColor}>
              We may update this Privacy Policy from time to time. We encourage you to review this Policy periodically.
            </Text>
          </Box>
        </VStack>
      </Box>
    </Box>
  );
}

export default PrivacyPolicy;
