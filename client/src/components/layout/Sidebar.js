import React from 'react';
import {
  Flex,
  useColorModeValue,
  Icon,
  Tooltip,
  Link,
  Text,
  VStack
} from '@chakra-ui/react';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdInventory,
  MdLocalShipping,
  MdOutlineModeEdit,
  MdOutlineInput,
  MdOutlineOutput,
  MdListAlt,
  MdAddBox,
} from 'react-icons/md';

function Sidebar({ onClose }) {
  const bg = useColorModeValue('white', 'gray.800');
  const hoverBg = useColorModeValue('brand.50', 'gray.700');
  const activeBg = useColorModeValue('brand.100', 'gray.600');
  const color = useColorModeValue('gray.600', 'gray.300');
  const activeColor = useColorModeValue('brand.700', 'white');
  const location = useLocation();

  const role = localStorage.getItem('userRole') || localStorage.getItem('role') || 'volunteer';

  const menuItems = [
    { label: 'Dashboard', icon: MdDashboard, to: '/dashboard', roles: ['admin', 'staff', 'volunteer'] },
    { label: 'View Inventory', icon: MdInventory, to: '/inventory', roles: ['admin', 'staff', 'volunteer'] },
    { label: 'Perform Distribution', icon: MdLocalShipping, to: '/distribution', roles: ['admin', 'staff'] },
    { label: 'Inputs (Receiving Stock)', icon: MdOutlineInput, to: '/inputs', roles: ['admin', 'staff'] },
    { label: 'Outputs', icon: MdOutlineOutput, to: '/output', roles: ['admin'] },
    { label: 'Product List', icon: MdListAlt, to: '/productlist', roles: ['admin', 'staff'] },
    { label: 'Modify Items', icon: MdOutlineModeEdit, to: '/modifyitem', roles: ['admin', 'staff'] },
    { label: 'Add New Item', icon: MdAddBox, to: '/additem', roles: ['admin', 'staff'] },
  ];

  return (
    <Flex as="aside" bg={bg} p={4} direction="column" h="100%" w="100%">
      <VStack spacing={2} align="stretch" mt={4}>
        {menuItems
          .filter(item => item.roles.includes(role))
          .map(({ label, icon, to }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={label}
                as={ReactRouterLink}
                to={to}
                onClick={onClose}
                _hover={{ textDecoration: 'none' }}
              >
                <Flex
                  align="center"
                  p={3}
                  mx={2}
                  borderRadius="lg"
                  role="group"
                  cursor="pointer"
                  bg={isActive ? activeBg : 'transparent'}
                  color={isActive ? activeColor : color}
                  _hover={{
                    bg: hoverBg,
                    color: activeColor,
                  }}
                  transition="all 0.2s"
                >
                  <Icon
                    mr={4}
                    fontSize="xl"
                    as={icon}
                  />
                  <Text fontWeight={isActive ? "600" : "500"}>{label}</Text>
                </Flex>
              </Link>
            );
          })}
      </VStack>
    </Flex>
  );
}

export default Sidebar;
