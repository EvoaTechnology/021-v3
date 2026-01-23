"use client";

import React, { useEffect, useRef } from "react";

interface Dot {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
}

export default function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dotsRef = useRef<Dot[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initDots();
        };

        // Initialize dots in a grid pattern
        const initDots = () => {
            const dots: Dot[] = [];
            const spacing = 80; // Space between dots
            const cols = Math.ceil(canvas.width / spacing);
            const rows = Math.ceil(canvas.height / spacing);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const x = i * spacing + spacing / 2;
                    const y = j * spacing + spacing / 2;
                    dots.push({
                        x,
                        y,
                        baseX: x,
                        baseY: y,
                        vx: 0,
                        vy: 0,
                    });
                }
            }

            dotsRef.current = dots;
        };

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const dots = dotsRef.current;
            const mouse = mouseRef.current;

            // Update dot positions based on cursor
            dots.forEach((dot) => {
                const dx = mouse.x - dot.x;
                const dy = mouse.y - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const repulsionRadius = 150;

                if (distance < repulsionRadius) {
                    // Repulsion effect
                    const force = (repulsionRadius - distance) / repulsionRadius;
                    const angle = Math.atan2(dy, dx);
                    dot.vx -= Math.cos(angle) * force * 2;
                    dot.vy -= Math.sin(angle) * force * 2;
                }

                // Apply velocity
                dot.x += dot.vx;
                dot.y += dot.vy;

                // Spring back to base position
                const returnForce = 0.05;
                dot.vx += (dot.baseX - dot.x) * returnForce;
                dot.vy += (dot.baseY - dot.y) * returnForce;

                // Damping
                dot.vx *= 0.9;
                dot.vy *= 0.9;
            });

            // Draw connections
            ctx.strokeStyle = "rgba(147, 51, 234, 0.15)"; // Purple with low opacity
            ctx.lineWidth = 1;

            for (let i = 0; i < dots.length; i++) {
                for (let j = i + 1; j < dots.length; j++) {
                    const dx = dots[i].x - dots[j].x;
                    const dy = dots[i].y - dots[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        const opacity = (1 - distance / 120) * 0.15;
                        ctx.strokeStyle = `rgba(147, 51, 234, ${opacity})`;
                        ctx.beginPath();
                        ctx.moveTo(dots[i].x, dots[i].y);
                        ctx.lineTo(dots[j].x, dots[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw dots
            dots.forEach((dot) => {
                const dx = mouse.x - dot.x;
                const dy = mouse.y - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const repulsionRadius = 150;

                let size = 2;
                if (distance < repulsionRadius) {
                    const shrinkFactor = distance / repulsionRadius;
                    size = 2 * shrinkFactor;
                }

                ctx.fillStyle = "rgba(147, 51, 234, 0.3)"; // Purple dots
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        // Initialize
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", handleMouseMove);
        animate();

        // Cleanup
        return () => {
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{ opacity: 0.6 }}
        />
    );
}
