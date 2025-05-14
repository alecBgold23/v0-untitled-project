interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return <p className="text-sm text-red-500 mt-1">{message}</p>
}
