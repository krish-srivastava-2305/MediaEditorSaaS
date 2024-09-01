'use client';
import React, { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

function page() {
  const router = useRouter()
  useEffect(()=>{
    router.push('/home')
  }, [])
  return (
    <div>
      
    </div>
  )
}

export default page

