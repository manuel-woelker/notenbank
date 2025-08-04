import { useState } from 'react';
import styled from 'styled-components';
import {DebugComponent} from "./DebugComponent.tsx";

const DebugContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: ${({ isOpen }) => (isOpen ? '0' : '-40%')};
  left: 0;
  right: 0;
  height: 40%;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: bottom 0.1s ease-in-out;
  padding: 1rem;
  overflow-y: auto;
`;

const ToggleButton = styled.button`
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 1001;
    background: rgba(0, 123, 255, 0.21);
    color: white;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;

    &:hover {
        transform: scale(1.1);
    }
`;

export function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDebug = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <DebugContainer isOpen={isOpen}>
        {isOpen && <DebugComponent />}
      </DebugContainer>
      <ToggleButton onClick={toggleDebug} aria-label={isOpen ? 'Close debug' : 'Open debug'}>
        {isOpen ? '×' : '🐛️'}
      </ToggleButton>
    </>
  );
}