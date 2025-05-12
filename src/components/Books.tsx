import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Container,
  SimpleGrid,
  Card,
  CardBody,
  Heading,
  Image,
  Text,
  Input,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useQuery } from "react-query";

interface Book {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  format: string;
  releaseDate: string;
  author: string;
  price: number;
  publisherRRP: number;
  pages: number;
  description: string;
  dimensions: string;
  wishList: boolean;
  isbn: string;
  publisher: string;
}

interface Genre {
  id: string;
  name: string;
}

const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch("/api/books"); // Replace with your actual API endpoint
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const fetchGenres = async (): Promise<Genre[]> => {
  const response = await fetch("/api/genres"); // Replace with your actual API endpoint
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const useBooks = () => useQuery<Book[]>("books", fetchBooks);
const useGenres = () => useQuery<Genre[]>("genres", fetchGenres);

const Books: React.FC = () => {
  const {
    data: books,
    error: booksError,
    isLoading: booksLoading,
  } = useBooks();
  const {
    data: genres,
    error: genresError,
    isLoading: genresLoading,
  } = useGenres();
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [type, setType] = useState<Genre | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (books) {
      setFilteredBooks(books);
    }
  }, [books]);

  const handleGenreSelect = (genre: Genre) => {
    setType(genre);
    if (books) {
      if (genre.name !== "All Genres") {
        setFilteredBooks(
          books.filter((book: Book) => book.type === genre.name)
        );
      } else {
        setFilteredBooks(books);
      }
    }
    setSearchQuery("");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (books) {
      setFilteredBooks(
        books.filter((book: Book) =>
          book.title.toLowerCase().startsWith(query.toLowerCase())
        )
      );
    }
    setType(null);
  };

  if (booksLoading || genresLoading) return <p>Loading...</p>;
  if (booksError || genresError) return <p>Error loading data</p>;

  const count = filteredBooks.length;

  return (
    <Box>
      <Breadcrumb>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Books</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Container maxW="container.xl">
        <HStack spacing={8} align="start">
          <VStack spacing={4} align="stretch">
            {genres &&
              genres.map((genre: Genre) => (
                <Box
                  key={genre.id}
                  cursor="pointer"
                  onClick={() => handleGenreSelect(genre)}
                  bg={type?.id === genre.id ? "gray.200" : "white"}
                  p={2}
                  borderRadius="md"
                  shadow="md"
                >
                  {genre.name}
                </Box>
              ))}
          </VStack>
          <VStack spacing={4} align="stretch" flex={1}>
            <Text>Showing {count} books in the database.</Text>
            <Input
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search..."
            />
            <SimpleGrid columns={{ sm: 1, md: 2 }} spacing={4}>
              {filteredBooks.map((item) => (
                <Link to={`/books/${item.id}`} key={item.id}>
                  <Card>
                    <Image
                      src={`../images/${item.isbn}.jpg`}
                      alt={item.title}
                    />
                    <CardBody>
                      <Heading size="md">{item.title}</Heading>
                      <Text>{item.subtitle}</Text>
                      <Text>Author: {item.author}</Text>
                      <Text>Price: {item.price}</Text>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </SimpleGrid>
          </VStack>
        </HStack>
      </Container>
    </Box>
  );
};

export default Books;
