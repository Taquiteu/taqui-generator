interface InputProps {
    placeholder?: string
    onChange: (text: string) => void
    value: string
}

const Input: React.FC<InputProps> = ({ onChange, value, placeholder }) => {
    return <input
          type="text"
          name="text"
          value={value}
          onChange={(v) => onChange(v.target.value)}
          placeholder={placeholder}
          required
          className="w-full p-3 text-2xl border-[3px] border-black rounded-md focus:outline-none focus:shadow-[3px_3px_0px_0px_#000000] transition-shadow duration-200"
        />
}

export default Input