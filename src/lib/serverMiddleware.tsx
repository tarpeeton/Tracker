interface IMidProps {
  children: React.ReactNode;
}


import ClientLogic from "./checkerAuth";

export default function ServerMiddleware({ children }: IMidProps) {
  return (
    <div>
      <ClientLogic />
      {children}
    </div>
  );
}
