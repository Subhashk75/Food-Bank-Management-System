import React, { useState, useEffect } from 'react';
import { 
  Stack, 
  InputGroup, 
  Input, 
  InputLeftAddon, 
  Button, 
  Box, 
  useColorModeValue,
  useToast,
  Select,
  Text,
  Spinner,
  Center,
  Heading,
  FormControl,
  FormLabel,
  InputLeftElement,
  Icon,
  SimpleGrid,
  Image,
  VStack,
  IconButton
} from '@chakra-ui/react';
import { MdAdd, MdImage, MdDescription, MdOutlineCategory, MdInventory, MdDelete } from 'react-icons/md';
import { productService, categoryService } from '../components/utils/api';
import Auth from '../components/utils/auth';
import { useNavigate } from 'react-router-dom';

function AddItem() {
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const headerTextCol = useColorModeValue('gray.800', 'white');
  const inputBg = useColorModeValue('gray.50', 'gray.600');
  const toast = useToast();
  const navigate = useNavigate();

  const [inputValues, setInputValues] = useState({
    name: '',
    description: '',
    quantity: '',
    categoryId: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!Auth.loggedIn()) {
      navigate("/");
    }

    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        setCategories(response.data);
        setCategoriesLoading(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch categories',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [navigate, toast]);

  const handleInputChange = (fieldName, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Maximum size is 5MB',
          status: 'warning',
          duration: 3000,
        });
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleAddItem = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', inputValues.name);
      formData.append('description', inputValues.description);
      formData.append('quantity', inputValues.quantity);
      formData.append('categoryId', inputValues.categoryId);
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await productService.create(formData);
      
      toast({
        title: 'Success',
        description: 'Product added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reset form after successful addition
      setInputValues({
        name: '',
        description: '',
        quantity: '',
        categoryId: '',
      });
      setImageFile(null);
      setImagePreview('');

      // Redirect to inventory after 1 second
      setTimeout(() => {
        navigate('/inventory');
      }, 1000);

    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add product',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      inputValues.name && 
      inputValues.categoryId && 
      inputValues.quantity && 
      !isNaN(inputValues.quantity)
    );
  };

  return (
    <Box>
      <Heading size="lg" mb={6} color={headerTextCol}>
        Add New Product
      </Heading>
      
      <Box 
        bg={cardBg} 
        borderRadius="xl" 
        shadow="sm" 
        border="1px" 
        borderColor={borderColor} 
        p={8} 
        maxW="800px" 
        mx="auto"
      >
        <Stack spacing={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <FormControl isRequired>
              <FormLabel fontWeight="600">Product Name</FormLabel>
              <Input
                placeholder="Product name"
                value={inputValues.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                bg={inputBg}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontWeight="600">Initial Quantity</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" children={<Icon as={MdInventory} color="gray.400" />} />
                <Input
                  placeholder="e.g. 100"
                  type="number"
                  min="0"
                  value={inputValues.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  bg={inputBg}
                />
              </InputGroup>
            </FormControl>
          </SimpleGrid>

          <FormControl isRequired>
            <FormLabel fontWeight="600">Category</FormLabel>
            {categoriesLoading ? (
              <Center py={2}>
                <Spinner size="sm" />
              </Center>
            ) : (
              <InputGroup>
                <InputLeftElement pointerEvents="none" children={<Icon as={MdOutlineCategory} color="gray.400" />} />
                <Select
                  placeholder="Select a category"
                  value={inputValues.categoryId}
                  onChange={(e) => handleInputChange('categoryId', e.target.value)}
                  bg={inputBg}
                  pl={10}
                >
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </InputGroup>
            )}
            {!categoriesLoading && categories.length === 0 && (
              <Text color="orange.500" mt={2} fontSize="sm">
                No categories available. Please create categories first.
              </Text>
            )}
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="600">Description</FormLabel>
            <InputGroup>
              <InputLeftElement pointerEvents="none" children={<Icon as={MdDescription} color="gray.400" />} />
              <Input
                placeholder="Brief item description"
                value={inputValues.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                bg={inputBg}
              />
            </InputGroup>
          </FormControl>

          <FormControl>
            <FormLabel fontWeight="600">Product Image</FormLabel>
            {imagePreview ? (
              <VStack align="center" pos="relative" border="1px dashed" borderColor="gray.300" p={4} borderRadius="md">
                <Image src={imagePreview} maxH="200px" borderRadius="md" alt="Preview" />
                <IconButton
                  icon={<MdDelete />}
                  size="sm"
                  colorScheme="red"
                  pos="absolute"
                  top={2}
                  right={2}
                  onClick={removeImage}
                  aria-label="Remove image"
                />
              </VStack>
            ) : (
              <Box
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                p={8}
                textAlign="center"
                cursor="pointer"
                _hover={{ borderColor: 'brand.500', bg: 'gray.50' }}
                onClick={() => document.getElementById('image-upload').click()}
              >
                <Icon as={MdImage} w={10} h={10} color="gray.400" mb={2} />
                <Text color="gray.500">Click to upload product image (Max 5MB)</Text>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Box>
            )}
          </FormControl>

          <Button
            mt={4}
            size="lg"
            colorScheme="brand"
            leftIcon={<MdAdd />}
            onClick={handleAddItem}
            isLoading={loading}
            isDisabled={!isFormValid() || loading}
            width="full"
          >
            Create Product
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

export default AddItem;