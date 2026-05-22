"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export default function DebugPage() {
    const [testEmail, setTestEmail] = useState("admin@etch.com");
    const [testPassword, setTestPassword] = useState("ADMIN123");
    const [testResult, setTestResult] = useState<any>(null);
    const [resetResult, setResetResult] = useState<any>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [debugToken] = useState(process.env.NEXT_PUBLIC_DEBUG_TOKEN || "debug-secret-123");

    const testPassword_ = async () => {
        setLoading("test");
        try {
            const res = await fetch("/api/debug/test-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: testEmail, password: testPassword }),
            });
            const data = await res.json();
            setTestResult(data);
        } catch (err) {
            setTestResult({ error: (err as any).message });
        } finally {
            setLoading(null);
        }
    };

    const resetUsers = async () => {
        setLoading("reset");
        try {
            const res = await fetch("/api/debug/reset-test-users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${debugToken}`,
                },
            });
            const data = await res.json();
            setResetResult(data);
        } catch (err) {
            setResetResult({ error: (err as any).message });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="font-playfair text-3xl font-bold text-[var(--text)] mb-2">🛠️ Débogage</h1>
                <p className="text-[var(--text)]/60 text-sm">Routes de test pour diagnostiquer les problèmes d'authentification</p>
            </div>

            <div className="grid gap-8">
                {/* Test Password Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6"
                >
                    <h2 className="text-xl font-bold text-[var(--text)] mb-4">🔑 Tester un Mot de Passe</h2>

                    <div className="space-y-4 mb-6">
                        <div>
                            <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Email</label>
                            <input
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--gold)]"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-[var(--text)]/50 uppercase tracking-wide mb-1.5 block">Mot de Passe</label>
                            <input
                                type="password"
                                value={testPassword}
                                onChange={(e) => setTestPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] focus:outline-none focus:border-[var(--gold)]"
                            />
                        </div>
                    </div>

                    <button
                        onClick={testPassword_}
                        disabled={loading === "test"}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold disabled:opacity-50"
                    >
                        {loading === "test" ? "Test..." : "Tester le Mot de Passe"}
                    </button>

                    {testResult && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                            <pre className="bg-[var(--bg)] p-4 rounded-lg overflow-auto text-sm border border-[var(--border)] text-[var(--text)]/70">
                                {JSON.stringify(testResult, null, 2)}
                            </pre>
                            {testResult.success && (
                                <p className="text-green-400 text-sm mt-2">✅ Mot de passe valide!</p>
                            )}
                            {testResult.success === false && (
                                <p className="text-red-400 text-sm mt-2">❌ Mot de passe invalide</p>
                            )}
                        </motion.div>
                    )}
                </motion.div>

                {/* Reset Users Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6"
                >
                    <h2 className="text-xl font-bold text-[var(--text)] mb-4">🔄 Réinitialiser les Utilisateurs de Test</h2>

                    <p className="text-[var(--text)]/60 text-sm mb-4">
                        Cela créera/réinitialisera les comptes de test avec les mots de passe suivants:
                    </p>

                    <div className="bg-[var(--bg)] p-4 rounded-lg mb-6 space-y-2 text-sm font-mono">
                        <div className="text-[var(--gold)]">admin@etch.com / ADMIN123</div>
                        <div className="text-blue-400">adjoint@etch.com / ADJOINT123</div>
                        <div className="text-green-400">client@etch.com / CLIENT123</div>
                    </div>

                    <button
                        onClick={resetUsers}
                        disabled={loading === "reset"}
                        className="w-full px-4 py-2.5 rounded-xl bg-[var(--gold)] text-[#0A0A0A] font-semibold disabled:opacity-50"
                    >
                        {loading === "reset" ? "Réinitialisation..." : "Réinitialiser les Utilisateurs"}
                    </button>

                    {resetResult && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
                            <pre className="bg-[var(--bg)] p-4 rounded-lg overflow-auto text-sm border border-[var(--border)] text-[var(--text)]/70">
                                {JSON.stringify(resetResult, null, 2)}
                            </pre>
                        </motion.div>
                    )}
                </motion.div>

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-amber-950/30 border border-amber-800/50 rounded-2xl p-6"
                >
                    <h2 className="text-xl font-bold text-amber-400 mb-4">⚠️ Information Importante</h2>

                    <ul className="space-y-2 text-sm text-[var(--text)]/70">
                        <li>• Ces routes de débogage ne sont disponibles qu'en développement</li>
                        <li>• Elles seront désactivées en production</li>
                        <li>• Utilisez-les uniquement pour diagnostiquer les problèmes d'authentification</li>
                        <li>• Les mots de passe sont stockés de manière sécurisée (hash bcrypt)</li>
                    </ul>

                    <div className="mt-4 p-3 bg-[var(--bg)] rounded-lg text-xs font-mono text-[var(--text)]/50">
                        Debug Token: {debugToken}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
