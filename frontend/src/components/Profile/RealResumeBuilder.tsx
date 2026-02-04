import React, { useState } from 'react';
import { 
    Download, 
    FileText, 
    User, 
    Briefcase, 
    GraduationCap, 
    Award,
    Mail,
    Phone,
    MapPin,
    Globe,
    Plus,
    Trash2,
    Eye,
    Save
} from 'lucide-react';

interface PersonalInfo {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
}

interface Experience {
    id: string;
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string[];
}

interface Education {
    id: string;
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa?: string;
}

interface Skill {
    id: string;
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface RealResumeBuilderProps {
    userId: string;
}

const RealResumeBuilder: React.FC<RealResumeBuilderProps> = ({ userId }) => {
    const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'preview'>('personal');
    
    // Personal Information
    const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
        fullName: 'Alex Johnson',
        email: 'alex.johnson@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        website: 'https://alexjohnson.dev',
        summary: 'Experienced full-stack developer with 5+ years of experience building scalable web applications. Passionate about creating user-friendly interfaces and robust backend systems.'
    });

    // Work Experience
    const [experiences, setExperiences] = useState<Experience[]>([
        {
            id: '1',
            title: 'Senior Full Stack Developer',
            company: 'TechStart Solutions',
            location: 'San Francisco, CA',
            startDate: '2022-01',
            endDate: '2024-01',
            current: false,
            description: [
                'Built and maintained 5+ full-stack web applications using React, Node.js, and PostgreSQL',
                'Increased client sales by 40% through performance optimizations and UX improvements',
                'Led a team of 3 junior developers and mentored them in best practices',
                'Implemented CI/CD pipelines reducing deployment time by 60%'
            ]
        },
        {
            id: '2',
            title: 'Frontend Developer',
            company: 'Digital Innovations Inc',
            location: 'Remote',
            startDate: '2020-06',
            endDate: '2022-01',
            current: false,
            description: [
                'Developed responsive web applications using React and TypeScript',
                'Collaborated with design team to implement pixel-perfect UI components',
                'Optimized application performance resulting in 30% faster load times'
            ]
        }
    ]);

    // Education
    const [education, setEducation] = useState<Education[]>([
        {
            id: '1',
            degree: 'Bachelor of Science in Computer Science',
            school: 'University of California, Berkeley',
            location: 'Berkeley, CA',
            graduationDate: '2020-05',
            gpa: '3.8'
        }
    ]);

    // Skills
    const [skills, setSkills] = useState<Skill[]>([
        { id: '1', name: 'React', level: 'Expert' },
        { id: '2', name: 'Node.js', level: 'Advanced' },
        { id: '3', name: 'TypeScript', level: 'Advanced' },
        { id: '4', name: 'PostgreSQL', level: 'Intermediate' },
        { id: '5', name: 'AWS', level: 'Intermediate' },
        { id: '6', name: 'Docker', level: 'Intermediate' }
    ]);

    const addExperience = () => {
        const newExp: Experience = {
            id: Date.now().toString(),
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ['']
        };
        setExperiences([...experiences, newExp]);
    };

    const updateExperience = (id: string, field: keyof Experience, value: any) => {
        setExperiences(experiences.map(exp => 
            exp.id === id ? { ...exp, [field]: value } : exp
        ));
    };

    const removeExperience = (id: string) => {
        setExperiences(experiences.filter(exp => exp.id !== id));
    };

    const addEducation = () => {
        const newEdu: Education = {
            id: Date.now().toString(),
            degree: '',
            school: '',
            location: '',
            graduationDate: ''
        };
        setEducation([...education, newEdu]);
    };

    const updateEducation = (id: string, field: keyof Education, value: string) => {
        setEducation(education.map(edu => 
            edu.id === id ? { ...edu, [field]: value } : edu
        ));
    };

    const removeEducation = (id: string) => {
        setEducation(education.filter(edu => edu.id !== id));
    };

    const addSkill = () => {
        const newSkill: Skill = {
            id: Date.now().toString(),
            name: '',
            level: 'Beginner'
        };
        setSkills([...skills, newSkill]);
    };

    const updateSkill = (id: string, field: keyof Skill, value: string) => {
        setSkills(skills.map(skill => 
            skill.id === id ? { ...skill, [field]: value } : skill
        ));
    };

    const removeSkill = (id: string) => {
        setSkills(skills.filter(skill => skill.id !== id));
    };

    const generatePDF = () => {
        // In a real app, this would generate and download a PDF
        alert('PDF generation would be implemented here using libraries like jsPDF or Puppeteer');
    };

    const saveResume = () => {
        // In a real app, this would save to backend
        localStorage.setItem('resume-data', JSON.stringify({
            personalInfo,
            experiences,
            education,
            skills
        }));
        alert('Resume saved successfully!');
    };

    const renderPersonalInfo = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                        type="text"
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({...personalInfo, fullName: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({...personalInfo, email: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    <input
                        type="tel"
                        value={personalInfo.phone}
                        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                        type="text"
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({...personalInfo, location: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
                    <input
                        type="url"
                        value={personalInfo.website}
                        onChange={(e) => setPersonalInfo({...personalInfo, website: e.target.value})}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Professional Summary</label>
                <textarea
                    value={personalInfo.summary}
                    onChange={(e) => setPersonalInfo({...personalInfo, summary: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Write a brief summary of your professional background and goals..."
                />
            </div>
        </div>
    );

    const renderExperience = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Work Experience</h2>
                <button
                    onClick={addExperience}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Experience
                </button>
            </div>
            
            {experiences.map((exp, index) => (
                <div key={exp.id} className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">Experience #{index + 1}</h3>
                        <button
                            onClick={() => removeExperience(exp.id)}
                            className="text-red-400 hover:text-red-300"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <input
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            value={exp.location}
                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <div className="flex gap-2">
                            <input
                                type="month"
                                placeholder="Start Date"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white flex-1"
                            />
                            <input
                                type="month"
                                placeholder="End Date"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                disabled={exp.current}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white flex-1 disabled:opacity-50"
                            />
                        </div>
                    </div>
                    
                    <div className="mb-4">
                        <label className="flex items-center gap-2 text-gray-300">
                            <input
                                type="checkbox"
                                checked={exp.current}
                                onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                className="rounded"
                            />
                            Currently working here
                        </label>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Job Description</label>
                        <textarea
                            value={exp.description.join('\n')}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value.split('\n'))}
                            rows={4}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                            placeholder="• Describe your key responsibilities and achievements&#10;• Use bullet points for better readability&#10;• Include quantifiable results when possible"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderEducation = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Education</h2>
                <button
                    onClick={addEducation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Education
                </button>
            </div>
            
            {education.map((edu, index) => (
                <div key={edu.id} className="bg-gray-800 p-6 rounded-lg border border-gray-600">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-white">Education #{index + 1}</h3>
                        <button
                            onClick={() => removeEducation(edu.id)}
                            className="text-red-400 hover:text-red-300"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <input
                            type="text"
                            placeholder="School"
                            value={edu.school}
                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <input
                            type="text"
                            placeholder="Location"
                            value={edu.location}
                            onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <input
                            type="month"
                            placeholder="Graduation Date"
                            value={edu.graduationDate}
                            onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                        <input
                            type="text"
                            placeholder="GPA (optional)"
                            value={edu.gpa || ''}
                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                        />
                    </div>
                </div>
            ))}
        </div>
    );

    const renderSkills = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Skills</h2>
                <button
                    onClick={addSkill}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Skill
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {skills.map((skill) => (
                    <div key={skill.id} className="bg-gray-800 p-4 rounded-lg border border-gray-600">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Skill name"
                                value={skill.name}
                                onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                            />
                            <select
                                value={skill.level}
                                onChange={(e) => updateSkill(skill.id, 'level', e.target.value)}
                                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                            </select>
                            <button
                                onClick={() => removeSkill(skill.id)}
                                className="text-red-400 hover:text-red-300"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPreview = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">Resume Preview</h2>
                <div className="flex gap-3">
                    <button
                        onClick={saveResume}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Save className="w-4 h-4" />
                        Save Resume
                    </button>
                    <button
                        onClick={generatePDF}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                </div>
            </div>
            
            {/* Resume Preview */}
            <div className="bg-white text-black p-8 rounded-lg max-w-4xl mx-auto" style={{ fontFamily: 'serif' }}>
                {/* Header */}
                <div className="text-center mb-6 border-b-2 border-gray-300 pb-4">
                    <h1 className="text-3xl font-bold mb-2">{personalInfo.fullName}</h1>
                    <div className="flex justify-center items-center gap-4 text-sm text-gray-600 flex-wrap">
                        <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {personalInfo.email}
                        </span>
                        <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {personalInfo.phone}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {personalInfo.location}
                        </span>
                        {personalInfo.website && (
                            <span className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                {personalInfo.website}
                            </span>
                        )}
                    </div>
                </div>
                
                {/* Summary */}
                {personalInfo.summary && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-2 text-gray-800">Professional Summary</h2>
                        <p className="text-gray-700 leading-relaxed">{personalInfo.summary}</p>
                    </div>
                )}
                
                {/* Experience */}
                {experiences.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-3 text-gray-800">Professional Experience</h2>
                        {experiences.map((exp) => (
                            <div key={exp.id} className="mb-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-lg">{exp.title}</h3>
                                    <span className="text-sm text-gray-600">
                                        {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                    </span>
                                </div>
                                <div className="text-gray-700 mb-2">
                                    <span className="font-medium">{exp.company}</span>
                                    {exp.location && <span> • {exp.location}</span>}
                                </div>
                                <ul className="list-disc list-inside text-gray-700 space-y-1">
                                    {exp.description.map((desc, idx) => (
                                        <li key={idx}>{desc}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Education */}
                {education.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-3 text-gray-800">Education</h2>
                        {education.map((edu) => (
                            <div key={edu.id} className="mb-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">{edu.degree}</h3>
                                        <div className="text-gray-700">
                                            {edu.school} • {edu.location}
                                        </div>
                                    </div>
                                    <div className="text-right text-sm text-gray-600">
                                        <div>{edu.graduationDate}</div>
                                        {edu.gpa && <div>GPA: {edu.gpa}</div>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {/* Skills */}
                {skills.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-bold mb-3 text-gray-800">Technical Skills</h2>
                        <div className="grid grid-cols-2 gap-2">
                            {skills.map((skill) => (
                                <div key={skill.id} className="flex justify-between">
                                    <span>{skill.name}</span>
                                    <span className="text-gray-600 text-sm">{skill.level}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">🚀 Professional Resume Builder</h1>
                    <p className="text-gray-300">Create a professional resume with real data and export to PDF</p>
                </div>
                
                {/* Navigation Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {[
                        { id: 'personal', label: 'Personal Info', icon: User },
                        { id: 'experience', label: 'Experience', icon: Briefcase },
                        { id: 'education', label: 'Education', icon: GraduationCap },
                        { id: 'skills', label: 'Skills', icon: Award },
                        { id: 'preview', label: 'Preview', icon: Eye }
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id as any)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                activeTab === id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </div>
                
                {/* Content */}
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
                    {activeTab === 'personal' && renderPersonalInfo()}
                    {activeTab === 'experience' && renderExperience()}
                    {activeTab === 'education' && renderEducation()}
                    {activeTab === 'skills' && renderSkills()}
                    {activeTab === 'preview' && renderPreview()}
                </div>
            </div>
        </div>
    );
};

export default RealResumeBuilder;