import React from 'react';
import { Box, Flex, useBreakpointValue, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, useDisclosure } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

function DashboardLayout() {
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex direction="column" minHeight="100vh">
      {/* Top Navigation */}
      <Header onOpenSidebar={onOpen} isMobile={isMobile} />

      <Flex flex="1" overflow="hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <Box w="250px" bg="white" boxShadow="sm" zIndex="1" borderRight="1px" borderColor="gray.100">
            <Sidebar />
          </Box>
        )}

        {/* Mobile Sidebar (Drawer) */}
        {isMobile && (
          <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <Box mt={8}>
                <Sidebar onClose={onClose} />
              </Box>
            </DrawerContent>
          </Drawer>
        )}

        {/* Main Content Area */}
        <Box flex="1" bg="gray.50" overflowY="auto" as="main">
          <Box p={{ base: 4, md: 8 }} maxW="1600px" mx="auto">
            <Outlet />
          </Box>
          <Footer />
        </Box>
      </Flex>
    </Flex>
  );
}

export default DashboardLayout;
