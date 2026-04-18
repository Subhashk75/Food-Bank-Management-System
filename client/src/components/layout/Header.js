import React from 'react';
import {
  Flex,
  Spacer,
  useColorMode,
  IconButton,
  HStack,
  Image,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text
} from '@chakra-ui/react';
import { MdMenu, MdDarkMode, MdLightMode } from 'react-icons/md';
import { useNavigate, Link as ReactRouterLink } from 'react-router-dom';

import Auth from '../utils/auth';
import Logo from '../../assets/FoodLogo.jpg';

function Header({ onOpenSidebar, isMobile }) {
  const { colorMode, toggleColorMode } = useColorMode();
  const navigate = useNavigate();

  const bg = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const handleLogout = () => {
    Auth.logout();
    navigate('/');
  };

  return (
    <Flex 
      as="header" 
      bg={bg} 
      color={color} 
      px={4} 
      py={3} 
      align="center" 
      borderBottom="1px" 
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={10}
    >
      {isMobile && (
        <IconButton
          variant="ghost"
          icon={<MdMenu size={24} />}
          onClick={onOpenSidebar}
          aria-label="Open Menu"
          mr={2}
        />
      )}
      
      <Flex align="center" as={ReactRouterLink} to="/dashboard">
        <Image
          src={Logo}
          alt="logo"
          height="40px"
          width="40px"
          objectFit="contain"
          borderRadius="md"
        />
        {!isMobile && (
          <Text ml={3} fontWeight="bold" fontSize="lg" color="brand.700">
            Food Bank System
          </Text>
        )}
      </Flex>

      <Spacer />

      <HStack spacing={4}>
        <IconButton
          variant="ghost"
          icon={colorMode === 'light' ? <MdDarkMode size={20} /> : <MdLightMode size={20} />}
          onClick={toggleColorMode}
          aria-label="Toggle Color Mode"
          borderRadius="full"
        />

        {Auth.loggedIn() && (
          <Menu>
            <MenuButton as={Flex} cursor="pointer" align="center">
              <Avatar size="sm" bg="brand.500" />
            </MenuButton>
            <MenuList>
              <MenuItem onClick={handleLogout} color="red.500" fontWeight="bold">
                Log Out
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </HStack>
    </Flex>
  );
}

export default Header;
