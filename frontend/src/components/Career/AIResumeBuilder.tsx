import React, { useState, useEffect } from 'react';
import { 
    Download, 
    Eye, 
    Sparkles, 
    FileText, 
    Palette, 
    Settings,
    Wand2,
    Star,
    Trophy,
    Briefcase,
    Heart,
    Shield,
    Zap,
    Crown,
    Rocket,
    Brain,
    Target,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface AIResumeBuilderProps {
    userId: string;
}

interface ResumeTemplate {
    id: string;
    name: string;
    description: string;
    category: string;
    preview: string;
    color: string;
}

const AIResumeBuilder: React.FC<AIResumeBuilderProps> = ({ userId }) => {
    const [activeStep, setActiveStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedResume, setGeneratedResume] = useState<any>(null);
    const [previewMode, setPreviewMode] = useState(false);
    const [exportFormat, setExportFormat] = useState<'HTML' | 'PDF' | 'DOCX'>('HTML');

    const templates: ResumeTemplate[] = [
        {
            id: 'modern-tech',
            name: 'Modern Technical',
            description: 'Perfect for developers and tech professionals',
            category: 'TECHNICAL',
            preview: 'bg-gradient-to-br from-blue-500 to-purple-600',
            color: 'blue'
        },
        {
            id: 'creative-portfolio',
            name: 'Creative Portfolio',
            description: 'Showcase your creative work and projects',
            category: 'CREATIVE',
            preview: 'bg-gradient-to-br from-pink-500 to-orange-500',
            color: 'pink'
        }
    ];

    const steps = [
        { id: 1, title: 'Choose Template', icon: Palette },
        { id: 2, title: 'AI Generation', icon: Brain },
        { id: 3, title: 'Customize', icon: Settings },
        { id: 4, title: 'Export', icon: Download }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
            {/* Header */}
            <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center">
                                <Wand2 className="w-8 h-8 mr-3 text-purple-400" />
                                AI Resume Builder
                            </h1>
                            <p className="text-purple-300 mt-2">Transform your Good Grid achievements into a professional resume</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-center space-x-8">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                                    activeStep >= step.id 
                                        ? 'bg-purple-500 border-purple-500 text-white' 
                                        : 'border-gray-600 text-gray-400'
                                }`}>
                                    <step.icon className="w-6 h-6" />
                                </div>
                                <div className="ml-3">
                                    <div className={`font-medium ${activeStep >= step.id ? 'text-white' : 'text-gray-400'}`}>
                                        {step.title}
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 mx-8 ${
                                        activeStep > step.id ? 'bg-purple-500' : 'bg-gray-600'
                                    }`}></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Template Selection */}
                {activeStep === 1 && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Choose Your Resume Template</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {templates.map((template) => (
                                <div
                                    key={template.id}
                                    onClick={() => setSelectedTemplate(template)}
                                    className={`relative cursor-pointer group transition-all duration-300 ${
                                        selectedTemplate?.id === template.id 
                                            ? 'ring-4 ring-purple-500 scale-105' 
                                            : 'hover:scale-105'
                                    }`}
                                >
                                    <div className="bg-black/50 backdrop-blur-sm rounded-xl border border-white/20 p-6 h-full">
                                        <div className={`w-full h-32 ${template.preview} rounded-lg mb-4 flex items-center justify-center`}>
                                            <FileText className="w-12 h-12 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
                                        <p className="text-gray-300 text-sm mb-3">{template.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs">
                                                {template.category}
                                            </span>
                                            {selectedTemplate?.id === template.id && (
                                                <CheckCircle className="w-5 h-5 text-green-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <button
                                onClick={() => selectedTemplate && setActiveStep(2)}
                                disabled={!selectedTemplate}
                                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Continue to AI Generation
                            </button>
                        </div>
                    </div>
                )}

                {/* AI Generation Step */}
                {activeStep === 2 && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                        <div className="text-center">
                            <Brain className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-4">AI Resume Generation</h2>
                            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                                Our AI will analyze your Good Grid profile and create a professional resume 
                                tailored to your achievements and career goals.
                            </p>
                            <button
                                onClick={() => setActiveStep(3)}
                                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2 mx-auto"
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Generate My Resume</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Customization Step */}
                {activeStep === 3 && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">Customize Your Resume</h2>
                        <div className="text-center">
                            <button
                                onClick={() => setActiveStep(4)}
                                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                            >
                                Continue to Export
                            </button>
                        </div>
                    </div>
                )}

                {/* Export Step */}
                {activeStep === 4 && (
                    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
                        <div className="text-center">
                            <Download className="w-16 h-16 text-green-400 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold text-white mb-4">Export Your Resume</h2>
                            <p className="text-gray-300 mb-8">Choose your preferred format and download your professional resume.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
                                {['HTML', 'PDF', 'DOCX'].map((format) => (
                                    <button
                                        key={format}
                                        onClick={() => setExportFormat(format as any)}
                                        className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                                            exportFormat === format
                                                ? 'border-purple-500 bg-purple-500/20'
                                                : 'border-gray-600 hover:border-gray-500'
                                        }`}
                                    >
                                        <FileText className="w-8 h-8 mx-auto mb-2 text-white" />
                                        <div className="font-semibold text-white">{format}</div>
                                        <div className="text-sm text-gray-300 mt-1">
                                            {format === 'HTML' && 'Web-friendly format'}
                                            {format === 'PDF' && 'Print-ready document'}
                                            {format === 'DOCX' && 'Editable Word document'}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 mx-auto">
                                <Download className="w-5 h-5" />
                                <span>Download Resume ({exportFormat})</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AIResumeBuilder;