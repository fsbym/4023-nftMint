import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders NFT Minting App title", () => {
  render(<App />);
  const titleElement = screen.getByText(/NFT Minting App/i);
  expect(titleElement).toBeInTheDocument();
});

test("connects to MetaMask when button is clicked", async () => {
  window.ethereum = {
    request: jest.fn().mockResolvedValue(["0x123"]),
  };

  render(<App />);
  const connectButton = screen.getByText(/Connect Metamask Wallet/i);
  fireEvent.click(connectButton);

  const connectedMessage = await screen.findByText(/Connected account/i);
  expect(connectedMessage).toBeInTheDocument();
});

test("displays message when MetaMask is not installed", () => {
  window.ethereum = undefined;

  render(<App />);
  const connectButton = screen.getByText(/Connect Metamask Wallet/i);
  fireEvent.click(connectButton);

  const messageElement = screen.getByText(/Please install MetaMask/i);
  expect(messageElement).toBeInTheDocument();
});
