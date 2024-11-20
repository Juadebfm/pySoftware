import React, { createContext, useState, useEffect } from "react";

export const AddressContext = createContext();

export const AddressProvider = ({ children }) => {
  const [addresses, setAddresses] = useState([]);
  const [paginatedAddresses, setPaginatedAddresses] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAddresses, setFilteredAddresses] = useState([]);

  useEffect(() => {
    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:3000/api/addresses", {
          headers: {
            "X-API-KEY": import.meta.env.VITE_API_KEY,
          },
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setAddresses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  // Filter addresses based on the search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredAddresses(addresses);
    } else {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filtered = addresses.filter((address) =>
        Object.values(address).some(
          (value) =>
            value && value.toString().toLowerCase().includes(lowerCaseQuery)
        )
      );
      setFilteredAddresses(filtered);
    }
  }, [searchQuery, addresses]);

  // Paginate the filtered addresses
  useEffect(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    setPaginatedAddresses(filteredAddresses.slice(startIndex, endIndex));
  }, [filteredAddresses, currentPage, recordsPerPage]);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredAddresses.length / recordsPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const setPage = (page) => {
    if (
      page >= 1 &&
      page <= Math.ceil(filteredAddresses.length / recordsPerPage)
    ) {
      setCurrentPage(page);
    }
  };

  // Edit Address Functionality
  const editAddress = async (userId, updatedData) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/addresses/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-API-KEY": import.meta.env.VITE_API_KEY,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Refresh the data
      const updatedAddresses = await fetch(
        "http://localhost:3000/api/addresses",
        {
          headers: { "X-API-KEY": import.meta.env.VITE_API_KEY },
        }
      );
      const data = await updatedAddresses.json();
      setAddresses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete Address Functionality
  const deleteAddress = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/addresses/${userId}`,
        {
          method: "DELETE",
          headers: { "X-API-KEY": import.meta.env.VITE_API_KEY },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      // Refresh the data
      const updatedAddresses = await fetch(
        "http://localhost:3000/api/addresses",
        {
          headers: { "X-API-KEY": import.meta.env.VITE_API_KEY },
        }
      );
      const data = await updatedAddresses.json();
      setAddresses(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AddressContext.Provider
      value={{
        addresses,
        paginatedAddresses,
        currentPage,
        recordsPerPage,
        totalPages: Math.ceil(filteredAddresses.length / recordsPerPage),
        loading,
        error,
        nextPage,
        previousPage,
        setPage,
        searchQuery,
        setSearchQuery,
        editAddress, // Expose edit functionality
        deleteAddress, // Expose delete functionality
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};