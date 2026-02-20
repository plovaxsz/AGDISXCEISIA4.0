
// --- UTILS ---
export const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
    }).format(value);
};

// --- LOGIC HELPERS ---

// Helper to determine UUCW Complexity
export const getUseCaseComplexity = (transactions: number) => {
    if (transactions <= 3) return { level: 'Simple', weight: 5 };
    if (transactions <= 7) return { level: 'Average', weight: 10 };
    return { level: 'Complex', weight: 15 };
};

// Helper to determine UAW Complexity
export const getActorComplexity = (type: string) => {
    if (type === 'API') return { level: 'Simple', weight: 1, desc: 'API / Command Prompt' };
    if (type === 'Protocol') return { level: 'Average', weight: 2, desc: 'TCP/IP Protocol' };
    return { level: 'Complex', weight: 3, desc: 'GUI / Web Page' };
};

// --- STATIC DATA ---

export const TCF_FACTORS = [
    { id: 'T1', name: 'Distributed System', weight: 2.0, desc: 'Sistem tersentralisasi/terdistribusi' },
    { id: 'T2', name: 'Performance', weight: 1.0, desc: 'Kecepatan akses / Response time' },
    { id: 'T3', name: 'End User Efficiency', weight: 1.0, desc: 'Efisiensi penggunaan oleh user' },
    { id: 'T4', name: 'Complex Internal Processing', weight: 1.0, desc: 'Kompleksitas proses internal' },
    { id: 'T5', name: 'Reusability', weight: 1.0, desc: 'Kode dapat digunakan kembali' },
    { id: 'T6', name: 'Easy to Install', weight: 0.5, desc: 'Kemudahan instalasi / deployment' },
    { id: 'T7', name: 'Easy to Use', weight: 0.5, desc: 'Kemudahan penggunaan (User Friendly)' },
    { id: 'T8', name: 'Portability', weight: 2.0, desc: 'Dapat dijalankan di berbagai platform' },
    { id: 'T9', name: 'Easy to Change', weight: 1.0, desc: 'Kemudahan modifikasi / maintenance' },
    { id: 'T10', name: 'Concurrency', weight: 1.0, desc: 'Penanganan akses bersamaan (Conccurency)' },
    { id: 'T11', name: 'Special Security Features', weight: 1.0, desc: 'Fitur keamanan khusus' },
    { id: 'T12', name: 'Provides Direct Access for Third Parties', weight: 1.0, desc: 'Akses langsung pihak ketiga (API)' },
    { id: 'T13', name: 'Special User Training Facilities', weight: 1.0, desc: 'Fasilitas pelatihan khusus user' },
];

export const EF_FACTORS = [
    { id: 'E1', name: 'Familiarity with System Development Process', weight: 1.5, desc: 'Tim familiar dengan SDLC' },
    { id: 'E2', name: 'Part-Time Workers', weight: -1.0, desc: 'Pekerja paruh waktu' },
    { id: 'E3', name: 'Analyst Capability', weight: 0.5, desc: 'Kemampuan analis sistem' },
    { id: 'E4', name: 'Application Experience', weight: 0.5, desc: 'Pengalaman aplikasi sejenis' },
    { id: 'E5', name: 'Object-Oriented Experience', weight: 1.0, desc: 'Pengalaman OOP' },
    { id: 'E6', name: 'Motivation', weight: 1.0, desc: 'Motivasi tim' },
    { id: 'E7', name: 'Difficult Programming Language', weight: -1.0, desc: 'Kesulitan bahasa pemrograman' },
    { id: 'E8', name: 'Stable Requirements', weight: 2.0, desc: 'Stabilitas kebutuhan (tidak berubah-ubah)' },
];
