"use client"

import { motion } from "framer-motion"
import React from "react"

export function PageAnimate({ children }: { children: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1"
        >
            {children}
        </motion.div>
    )
}
