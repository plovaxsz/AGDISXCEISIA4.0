
import React, { useEffect, useRef, useState } from 'react';
import { GraphNode, GraphEdge } from '../types';
import { ZoomIn, ZoomOut, RefreshCw, Layers, Maximize, Info } from 'lucide-react';

interface IntelligenceGraphProps {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

interface SimNode extends GraphNode {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
}

const IntelligenceGraph: React.FC<IntelligenceGraphProps> = ({ nodes, edges }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [simNodes, setSimNodes] = useState<SimNode[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const animationRef = useRef<number>(0);

    // Financial Theme Colors
    const getColor = (type: string) => {
        switch (type) {
            case 'PROJECT': return '#3B82F6'; // Blue
            case 'RISK': return '#EF4444'; // Red
            case 'REQUIREMENT': return '#10B981'; // Emerald
            case 'STAKEHOLDER': return '#8B5CF6'; // Purple
            case 'AUDIT_SCORE': return '#F59E0B'; // Amber
            default: return '#64748B'; // Slate
        }
    };

    const getRadius = (type: string) => {
        return type === 'PROJECT' ? 30 : type === 'RISK' ? 22 : 16;
    };

    // Initialize Simulation
    useEffect(() => {
        if (!nodes.length) return;

        const width = svgRef.current?.clientWidth || 800;
        const height = svgRef.current?.clientHeight || 600;

        const initialNodes: SimNode[] = nodes.map((n, i) => ({
            ...n,
            x: width / 2 + (Math.random() - 0.5) * 400,
            y: height / 2 + (Math.random() - 0.5) * 400,
            vx: 0,
            vy: 0,
            radius: getRadius(n.type)
        }));

        setSimNodes(initialNodes);
    }, [nodes]);

    // Physics Loop
    useEffect(() => {
        if (simNodes.length === 0) return;

        const runSimulation = () => {
            setSimNodes(prevNodes => {
                const newNodes = prevNodes.map(n => ({ ...n }));
                const width = svgRef.current?.clientWidth || 800;
                const height = svgRef.current?.clientHeight || 600;
                
                const k = 0.04; // Spring constant
                const repulsion = 12000; // Force repulsion
                const damping = 0.8; 
                const centerPull = 0.005;
                const minDistance = 150;

                // 1. Repulsion & Collision Prevention
                for (let i = 0; i < newNodes.length; i++) {
                    for (let j = i + 1; j < newNodes.length; j++) {
                        const dx = newNodes[i].x - newNodes[j].x;
                        const dy = newNodes[i].y - newNodes[j].y;
                        const distSq = dx * dx + dy * dy;
                        const dist = Math.sqrt(distSq) || 1;
                        
                        const radiusSum = newNodes[i].radius + newNodes[j].radius + 20;

                        // Force-directed repulsion
                        if (dist < minDistance * 2) {
                            const force = repulsion / (distSq + 100);
                            const fx = (dx / dist) * force;
                            const fy = (dy / dist) * force;
                            newNodes[i].vx += fx;
                            newNodes[i].vy += fy;
                            newNodes[j].vx -= fx;
                            newNodes[j].vy -= fy;
                        }

                        // Hard Collision prevention
                        if (dist < radiusSum) {
                            const overlap = radiusSum - dist;
                            const nx = dx / dist;
                            const ny = dy / dist;
                            const moveX = nx * overlap * 0.5;
                            const moveY = ny * overlap * 0.5;
                            newNodes[i].x += moveX;
                            newNodes[i].y += moveY;
                            newNodes[j].x -= moveX;
                            newNodes[j].y -= moveY;
                        }
                    }
                }

                // 2. Attraction (Edges)
                edges.forEach(e => {
                    const source = newNodes.find(n => n.id === e.source);
                    const target = newNodes.find(n => n.id === e.target);
                    if (source && target) {
                        const dx = target.x - source.x;
                        const dy = target.y - source.y;
                        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                        const targetDist = 120;
                        const force = (dist - targetDist) * k; 
                        const fx = (dx / dist) * force;
                        const fy = (dy / dist) * force;
                        source.vx += fx;
                        source.vy += fy;
                        target.vx -= fx;
                        target.vy -= fy;
                    }
                });

                // 3. Center Gravity & Update positions
                newNodes.forEach(n => {
                    n.vx += (width / 2 - n.x) * centerPull;
                    n.vy += (height / 2 - n.y) * centerPull;

                    n.vx *= damping;
                    n.vy *= damping;
                    n.x += n.vx;
                    n.y += n.vy;
                });

                return newNodes;
            });

            animationRef.current = requestAnimationFrame(runSimulation);
        };

        animationRef.current = requestAnimationFrame(runSimulation);
        return () => cancelAnimationFrame(animationRef.current!);
    }, [edges, simNodes.length]); 

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const scale = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom(prev => Math.min(Math.max(prev * scale, 0.5), 3));
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setMousePos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
    };

    return (
        <div 
            ref={containerRef}
            className="relative w-full h-full bg-[#0F172A] overflow-hidden group rounded-xl"
            onMouseMove={handleMouseMove}
        >
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" 
                 style={{ 
                     backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', 
                     backgroundSize: '30px 30px' 
                 }}>
            </div>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-20">
                <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))} className="p-2 bg-slate-800/80 backdrop-blur text-white rounded-lg hover:bg-slate-700 border border-slate-700 transition-colors shadow-lg"><ZoomIn className="w-4 h-4"/></button>
                <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-2 bg-slate-800/80 backdrop-blur text-white rounded-lg hover:bg-slate-700 border border-slate-700 transition-colors shadow-lg"><ZoomOut className="w-4 h-4"/></button>
                <button onClick={() => { setZoom(1); setPan({x:0, y:0}); }} className="p-2 bg-slate-800/80 backdrop-blur text-white rounded-lg hover:bg-slate-700 border border-slate-700 transition-colors shadow-lg"><RefreshCw className="w-4 h-4"/></button>
            </div>

            <div className="absolute top-4 left-4 z-20">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-900/40 backdrop-blur border border-blue-500/30 rounded-full text-blue-300 text-[10px] font-black uppercase tracking-widest shadow-xl">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Intelligent Mind-Map
                </div>
            </div>

            <svg 
                ref={svgRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                onWheel={handleWheel}
                onMouseDown={(e) => {
                    const start = { x: e.clientX - pan.x, y: e.clientY - pan.y };
                    const onMove = (mv: MouseEvent) => {
                        setPan({ x: mv.clientX - start.x, y: mv.clientY - start.y });
                    };
                    const onUp = () => {
                        window.removeEventListener('mousemove', onMove);
                        window.removeEventListener('mouseup', onUp);
                    };
                    window.addEventListener('mousemove', onMove);
                    window.addEventListener('mouseup', onUp);
                }}
            >
                <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                    {/* Edges */}
                    {edges.map((e, i) => {
                        const s = simNodes.find(n => n.id === e.source);
                        const t = simNodes.find(n => n.id === e.target);
                        if (!s || !t) return null;
                        return (
                            <g key={i}>
                                <line 
                                    x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                                    stroke="#334155"
                                    strokeWidth={1.5}
                                    strokeOpacity={0.4}
                                />
                            </g>
                        );
                    })}

                    {/* Nodes */}
                    {simNodes.map((n) => (
                        <g 
                            key={n.id} 
                            transform={`translate(${n.x}, ${n.y})`}
                            onMouseEnter={() => setHoveredNode(n.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={(e) => { e.stopPropagation(); setSelectedNode(selectedNode?.id === n.id ? null : n); }}
                            className="cursor-pointer transition-all duration-300"
                            style={{ 
                                opacity: (hoveredNode && hoveredNode !== n.id) ? 0.3 : 1,
                                filter: selectedNode?.id === n.id ? 'drop-shadow(0 0 10px ' + getColor(n.type) + ')' : 'none'
                            }}
                        >
                            {/* Glow Effect */}
                            {hoveredNode === n.id && (
                                <circle r={n.radius * 2} fill={getColor(n.type)} fillOpacity={0.05} className="animate-pulse-slow" />
                            )}

                            {/* Outer Ring */}
                            <circle r={n.radius * 1.4} fill={getColor(n.type)} fillOpacity={0.1} stroke={getColor(n.type)} strokeOpacity={0.2} strokeWidth={1} />
                            
                            {/* Core Node */}
                            <circle 
                                r={n.radius} 
                                fill="#0F172A" 
                                stroke={getColor(n.type)}
                                strokeWidth={selectedNode?.id === n.id ? 4 : 2}
                            />
                            
                            {/* Inner Dot */}
                            <circle r={n.radius * 0.4} fill={getColor(n.type)} fillOpacity={selectedNode?.id === n.id ? 1 : 0.8} />
                            
                            {/* Label */}
                            <text 
                                dy={n.radius + 18} 
                                textAnchor="middle" 
                                className="text-[9px] fill-slate-300 font-bold pointer-events-none uppercase tracking-widest drop-shadow-md"
                            >
                                {n.label.length > 20 ? n.label.substring(0, 18) + '..' : n.label}
                            </text>
                        </g>
                    ))}
                </g>
            </svg>

            {/* Enhanced Tooltip */}
            {(hoveredNode || selectedNode) && (() => {
                const node = simNodes.find(n => n.id === (hoveredNode || selectedNode?.id));
                if (!node) return null;
                return (
                    <div 
                        className={`absolute pointer-events-none z-50 bg-[#1E293B] border-2 rounded-2xl shadow-2xl text-white overflow-hidden w-64 animate-fade-in`}
                        style={{
                            left: mousePos.x + 20,
                            top: mousePos.y + 20,
                            borderColor: getColor(node.type) + '44'
                        }}
                    >
                        <div className="px-4 py-2 border-b border-slate-800 bg-[#0F172A] flex justify-between items-center">
                            <div className="font-black text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{backgroundColor: getColor(node.type)}}></span>
                                {node.type}
                            </div>
                            <span className="font-mono text-[10px] text-emerald-400 font-bold">{node.confidence}% CONF</span>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="font-bold text-sm leading-tight text-white">{node.label}</div>
                            
                            {/* Contextual Meta Info */}
                            <div className="space-y-2 pt-2 border-t border-slate-800/50">
                                {node.type === 'RISK' && (
                                    <div className="text-[10px] leading-relaxed text-slate-400 italic">
                                        Impact level analyzed as high priority. Mitigation recommended in next phase.
                                    </div>
                                )}
                                {node.type === 'REQUIREMENT' && (
                                    <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded">
                                        <span className="text-[9px] font-bold text-slate-500 uppercase">Criticality</span>
                                        <span className="text-[10px] font-black text-blue-400 uppercase">Mandatory</span>
                                    </div>
                                )}
                                {node.type === 'PROJECT' && (
                                    <div className="text-[10px] text-slate-300 font-medium">
                                        Central entity for this strategic intelligence trace.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default IntelligenceGraph;
