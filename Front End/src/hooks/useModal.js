import { useState, useCallback } from "react";

const useModal = (initialData = null) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(initialData);

  const openModal = useCallback((item) => {
    setSelected(item);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setSelected(null);
  }, []);

  return {
    isOpen,
    selected,
    openModal,
    closeModal,
    setSelected,
  };
};

export default useModal;
