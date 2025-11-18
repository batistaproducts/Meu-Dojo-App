
import React, { useState, useEffect } from 'react';
import { DashboardConfig, Student, Dojo } from '../../types';
import { supabase } from '../../services/supabaseClient';
import SpinnerIcon from '../icons/SpinnerIcon';

interface MetricsViewProps {
    students: Student[];
    dojo: Dojo | null;
}

// Simplified components for charts (SVG based to avoid heavy dependencies)

const KPIComponent: React.FC<{ value: number | string }> = ({ value }) => (
    <div className="flex items-center justify-center h-full">
        <span className="text-6xl font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
);

const PieChartComponent: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

    return (
        <div className="flex flex-col sm:flex-row items-center justify-around h-full gap-4">
            <div className="relative w-40 h-40">
                <svg viewBox="-1 -1 2 2" className="transform -rotate-90 w-full h-full">
                    {data.map((slice, i) => {
                        if (total === 0) return null;
                        const startPercent = cumulativePercent;
                        const slicePercent = slice.value / total;
                        cumulativePercent += slicePercent;
                        
                        // Handle single slice taking 100%
                        if (slicePercent === 1) {
                             return (
                                <circle key={i} cx="0" cy="0" r="1" fill={colors[i % colors.length]} />
                             );
                        }

                        const [startX, startY] = getCoordinatesForPercent(startPercent);
                        const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
                        const largeArcFlag = slicePercent > 0.5 ? 1 : 0;
                        
                        const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} L 0 0`;

                        return (
                            <path key={i} d={pathData} fill={colors[i % colors.length]} stroke="white" strokeWidth="0.02" />
                        );
                    })}
                </svg>
            </div>
            <div className="flex flex-col gap-2 overflow-y-auto max-h-40">
                {data.map((slice, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[i % colors.length] }}></div>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{slice.label}</span>
                        <span className="text-gray-500 dark:text-gray-400">({((slice.value / total) * 100).toFixed(1)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const BarChartComponent: React.FC<{ data: { label: string; value: number; value2?: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => Math.max(d.value, d.value2 || 0)));
    
    return (
        <div className="w-full h-full flex flex-col justify-center gap-4 px-4">
            {data.map((item, i) => (
                <div key={i} className="w-full">
                     <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                        <span>{item.label}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2">
                            <div className="h-6 bg-blue-500 rounded-r-md transition-all duration-500" style={{ width: `${(item.value / (maxValue || 1)) * 100}%` }}></div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Real: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value)}</span>
                        </div>
                        {item.value2 !== undefined && (
                            <div className="flex items-center gap-2">
                                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded-r-md transition-all duration-500" style={{ width: `${(item.value2 / (maxValue || 1)) * 100}%` }}></div>
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Prev: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.value2)}</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

const ColumnChartComponent: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    return (
        <div className="w-full h-full flex items-end justify-around pb-6 px-2 gap-2">
            {data.map((item, i) => (
                <div key={i} className="flex flex-col items-center flex-1 group h-full justify-end">
                     <div 
                        className="w-full max-w-[40px] bg-red-500 rounded-t-md transition-all duration-500 hover:bg-red-600 relative"
                        style={{ height: `${(item.value / (maxValue || 1)) * 80}%`, minHeight: '4px' }}
                     >
                         <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                             {item.value}
                         </div>
                     </div>
                     <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 truncate w-full text-center">{item.label}</span>
                </div>
            ))}
        </div>
    );
};


const MetricsView: React.FC<MetricsViewProps> = ({ students, dojo }) => {
    const [configs, setConfigs] = useState<DashboardConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [metricsData, setMetricsData] = useState<Record<string, any>>({});

    useEffect(() => {
        const fetchConfigs = async () => {
            setLoading(true);
            try {
                let query = supabase
                    .from('dashboards_configs')
                    .select('*')
                    .eq('status', true)
                    .order('posicao', { ascending: true });
                
                if (dojo) {
                    // Filter: id_dojo is null OR id_dojo = current dojo
                     query = query.or(`id_dojo.is.null,id_dojo.eq.${dojo.id}`);
                } else {
                     query = query.is('id_dojo', null);
                }

                const { data, error } = await query;
                if (error) throw error;
                setConfigs(data || []);
            } catch (error) {
                console.error("Error loading metrics config:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchConfigs();
    }, [dojo]);

    useEffect(() => {
        if (configs.length > 0) {
            processRules();
        }
    }, [configs, students]);

    const processRules = () => {
        const computed: Record<string, any> = {};

        configs.forEach(config => {
            const rule = config.json_regras;
            try {
                // 1. Active Students Count
                if (rule.source === 'students' && rule.operation === 'count') {
                    computed[config.id_dash] = students.length;
                }
                
                // 2. Graduation Proportion (Pie)
                else if (rule.source === 'students' && rule.operation === 'groupBy' && rule.field) {
                    const field = rule.field as keyof Student | 'belt.name'; // Type assertion helper
                    const grouped: Record<string, number> = {};
                    
                    students.forEach(s => {
                        let key = 'Unknown';
                        if (field === 'belt.name') key = s.belt.name;
                        // Add other fields if needed
                        
                        grouped[key] = (grouped[key] || 0) + 1;
                    });

                    computed[config.id_dash] = Object.entries(grouped).map(([label, value]) => ({ label, value }));
                }

                // 3. Revenue (Bar)
                else if (rule.source === 'financial' && rule.operation === 'revenue_comparison') {
                    const currentYear = new Date().getFullYear();
                    
                    // Forecast: Monthly Fee * 12 (active students)
                    const forecast = students.reduce((acc, s) => acc + (s.tuition_fee * 12), 0);
                    
                    // Actual: Sum of 'paid' payments in current year
                    const actual = students.reduce((acc, s) => {
                        const paidAmount = s.payments
                            .filter(p => p.year === currentYear && p.status === 'paid')
                            .length * s.tuition_fee;
                        return acc + paidAmount;
                    }, 0);

                    computed[config.id_dash] = [{
                        label: `Ano ${currentYear}`,
                        value: actual,  // Realizado
                        value2: forecast // Previsto
                    }];
                }

                // 4. Enrollment Seasonality (Column)
                else if (rule.source === 'history' && rule.operation === 'enrollment_seasonality') {
                     const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                     const counts = new Array(12).fill(0);

                     students.forEach(s => {
                         // Use the first entry in graduation history as proxy for enrollment if created_at isn't available on Student type locally
                         // Ideally Student type should have created_at. Using first graduation date as fallback.
                         const firstDate = s.graduation_history.length > 0 ? s.graduation_history[0].date : null;
                         if (firstDate) {
                             const date = new Date(firstDate);
                             counts[date.getMonth()]++;
                         }
                     });

                     computed[config.id_dash] = months.map((label, index) => ({
                         label,
                         value: counts[index]
                     }));
                }

            } catch (e) {
                console.error(`Error processing rule for dash ${config.id_dash}:`, e);
                computed[config.id_dash] = null;
            }
        });

        setMetricsData(computed);
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><SpinnerIcon className="w-12 h-12 text-red-600" /></div>;
    }

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold font-cinzel text-gray-900 dark:text-white mb-8">Métricas e Resultados</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {configs.map(config => {
                    const data = metricsData[config.id_dash];
                    const gridClass = config.json_config.colunas === 2 ? 'md:col-span-2' : 'md:col-span-1';
                    const heightClass = config.json_config.linhas > 1 ? 'h-96' : 'h-64';
                    
                    return (
                        <div key={config.id_dash} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col ${gridClass} ${heightClass}`}>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                                {config.json_config.Titulo}
                            </h3>
                            <div className="flex-grow relative">
                                {data === undefined || data === null ? (
                                    <div className="flex items-center justify-center h-full text-gray-400">Sem dados</div>
                                ) : (
                                    <>
                                        {config.json_config.Tipo === 'Quantitativo' && <KPIComponent value={data} />}
                                        {config.json_config.Tipo === 'Pizza' && <PieChartComponent data={data} />}
                                        {config.json_config.Tipo === 'Barra' && <BarChartComponent data={data} />}
                                        {config.json_config.Tipo === 'Coluna' && <ColumnChartComponent data={data} />}
                                        {config.json_config.Tipo === 'Linha' && <ColumnChartComponent data={data} />} {/* Fallback to Column for now */}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {configs.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                    <p>Nenhum dashboard configurado.</p>
                </div>
            )}
        </div>
    );
};

export default MetricsView;
