"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
    Search,
    FileText,
    Play,
    Moon,
    Sun,
    Laptop,
    ArrowRight,
    LayoutDashboard,
    Zap,
    Bug,
    ArrowLeftRight
} from "lucide-react"
import { useTheme } from "next-themes"
import type { TestRun } from "@/types"
import { DialogTitle } from "@/components/ui/dialog"

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export function CommandMenu() {
    const [open, setOpen] = React.useState(false)
    const [runs, setRuns] = React.useState<TestRun[]>([])
    const { setTheme, theme } = useTheme()
    const router = useRouter()

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    React.useEffect(() => {
        if (open) {
            const savedRuns = localStorage.getItem('testRuns')
            if (savedRuns) {
                try {
                    setRuns(JSON.parse(savedRuns))
                } catch (e) {
                    console.error("Failed to parse runs for command menu")
                }
            }
        }
    }, [open])

    const runCommand = React.useCallback((command: () => void) => {
        setOpen(false)
        command()
    }, [])

    // Get unique tests across all runs for quick search
    const uniqueTests = React.useMemo(() => {
        const tests = new Map();
        runs.forEach(run => {
            run.tests.forEach(test => {
                if (!tests.has(test.name)) {
                    tests.set(test.name, {
                        name: test.name,
                        lastStatus: test.status,
                        runId: run.runId
                    });
                }
            });
        });
        return Array.from(tests.values()).slice(0, 10); // Limit to top 10 for performance in menu
    }, [runs]);

    return (
        <>
            <Command.Dialog
                open={open}
                onOpenChange={setOpen}
                label="Global Command Menu"
                className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] p-4 sm:p-6 shadow-2xl"
            >
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-300" aria-hidden="true" />
                <DialogTitle className="sr-only">Global Command Menu</DialogTitle>
                <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-background/70 shadow-2xl backdrop-blur-2xl animate-in zoom-in-95 duration-300 ring-1 ring-white/10">
                    <div className="flex items-center border-b border-white/5 px-4 py-4">
                        <Search className="mr-3 h-5 w-5 text-muted-foreground" />
                        <Command.Input
                            placeholder="Type a command or search tests..."
                            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/50 disabled:cursor-not-allowed"
                        />
                        <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded bg-muted/50 px-2 font-mono text-[10px] font-medium opacity-100 sm:flex border border-white/10">
                            <span className="text-xs">ESC</span>
                        </kbd>
                    </div>
                    <Command.List className="max-h-[450px] overflow-y-auto p-3 scroll-smooth scrollbar-hide">
                        <Command.Empty className="py-12 text-center text-sm text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                                <Bug className="h-8 w-8 opacity-20" />
                                <span>No results matching your query.</span>
                            </div>
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="px-2 py-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/'))}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-foreground hover:bg-primary/10 rounded-xl cursor-pointer transition-all group aria-selected:bg-primary/10"
                            >
                                <LayoutDashboard className="h-4 w-4 text-muted-foreground group-hover:text-primary group-aria-selected:text-primary" />
                                <span className="font-semibold">Go to Dashboard</span>
                                <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 group-aria-selected:opacity-100 transition-opacity" />
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Recent Executions" className="px-2 py-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em] mt-2">
                            {runs.slice(0, 5).map((run) => (
                                <Command.Item
                                    key={run.runId}
                                    onSelect={() => runCommand(() => router.push(`/run/${run.runId}`))}
                                    className="flex items-center gap-3 px-3 py-3 text-sm text-foreground hover:bg-primary/10 rounded-xl cursor-pointer transition-all group aria-selected:bg-primary/10"
                                >
                                    <div className="h-2 w-2 rounded-full bg-blue-500/50" />
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{run.runId.substring(0, 20)}...</span>
                                        <span className="text-[10px] font-medium opacity-40">{new Date(run.executionDate).toLocaleString()}</span>
                                    </div>
                                    <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 group-aria-selected:opacity-100 transition-opacity" />
                                </Command.Item>
                            ))}
                        </Command.Group>

                        <Command.Separator className="h-px bg-white/5 my-3" />

                        <Command.Group heading="Tests Quick-Jump" className="px-2 py-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                            {uniqueTests.map((test, i) => (
                                <Command.Item
                                    key={`${test.name}-${i}`}
                                    onSelect={() => runCommand(() => router.push(`/run/${test.runId}`))}
                                    className="flex items-center gap-3 px-3 py-3 text-sm text-foreground hover:bg-primary/10 rounded-xl cursor-pointer transition-all group aria-selected:bg-primary/10"
                                >
                                    <Zap className="h-4 w-4 text-yellow-500/50 group-hover:text-yellow-500" />
                                    <span className="font-medium truncate max-w-[400px]">{test.name}</span>
                                    <span className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded border ${test.lastStatus === 'passed' ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/5' : 'border-rose-500/20 text-rose-500 bg-rose-500/5'
                                        }`}>
                                        {test.lastStatus.toUpperCase()}
                                    </span>
                                </Command.Item>
                            ))}
                        </Command.Group>

                        <Command.Separator className="h-px bg-white/5 my-3" />

                        <Command.Group heading="System" className="px-2 py-2 text-[10px] font-black text-muted-foreground/40 uppercase tracking-[0.2em]">
                            <Command.Item
                                onSelect={() => runCommand(() => {
                                    fetch(`${SERVER_URL}/api/run-all-tests`, { method: 'POST' })
                                })}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-foreground hover:bg-green-500/10 rounded-xl cursor-pointer transition-all group aria-selected:bg-green-500/10"
                            >
                                <Play className="h-4 w-4 text-green-500" />
                                <span className="font-bold text-green-500/80">Execute All Tests</span>
                            </Command.Item>

                            <Command.Item
                                onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-foreground hover:bg-primary/10 rounded-xl cursor-pointer transition-all group aria-selected:bg-primary/10"
                            >
                                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                                <span>Toggle Theme</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>

                    <div className="p-4 bg-muted/10 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/10 italic">ENTER</kbd>
                                <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Select</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <kbd className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-bold border border-white/10 italic">↑↓</kbd>
                                <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Navigate</span>
                            </div>
                        </div>
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-widest">
                            v1.0.4-Stable
                        </div>
                    </div>
                </div>
            </Command.Dialog>
        </>
    )
}
