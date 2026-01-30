'use client'

import UploadZone from './UploadZone'

export default function UploadPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-8 text-[#c7a87e] tracking-widest uppercase border-b border-[#3e2b20] pb-4">
                Register New Document
            </h2>
            <UploadZone />
        </div>
    )
}
