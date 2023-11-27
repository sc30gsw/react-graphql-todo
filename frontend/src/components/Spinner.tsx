import React from 'react'

const Spinner = ({ color = 'border-blue-500' }: { color?: string }) => {
  return (
    <div className="mt-10 flex justify-center items-center">
      <div
        className={`h-10 w-10 animate-spin rounded-full border-4 ${color} border-t-transparent`}
      ></div>
    </div>
  )
}

export default Spinner
