import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
  return (
    <nav className="w-full flex justify-between items-center p-4 bg-white shadow">
      <h1 className="font-semibold text-xl text-gray-800">ElliptiCheck</h1>
      <ConnectButton />
    </nav>
  );
}
