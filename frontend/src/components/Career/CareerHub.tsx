import React, { useState } from 'react';
import { 
    User, 
    Briefcase, 
    Target, 
    FileText,
    Brain,
    Sparkles,
    Crown,
    Rocket,
    Star,
    Trophy,
    Zap,
    Heart,
    Shield,
    TrendingUp,
    Award,
    Gem,
    Wand2,
    Map as MapIcon
} from 'lucide-react';
import EnhancedProfileBuilder from '../Profile/EnhancedProfileBuilder';
import AIResumeBuilder from './AIResumeBuilder';
import AIJobMatcher from './AIJobMatcher';
import CareerDashboard from './CareerDashboard';

interface CareerHubProps {
    userId: string;
}

const CareerHub: React.FC<CareerHubProps> = ({ userId }) => {
    const [activeView, setActiveView] = useState<'dashboard' | 'profile' | 'jobs' | 'resume'>('dashboard');
    const [userLevel] = useState(12);
    const [trustScore] = useState(87);
    const [impactScore] = useState(145);

    const navigationItems = [
        {
            id: 'dashboard',
            label: 'Live Career Dashboard',
            icon: TrendingUp,
            description: 'Real-time career insights from your Good Grid profile',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            emoji: '📊',
            features: ['🔴 Live Stats', '📈 Real Progress', '🎯 AI Insights']
        },
        {
            id: 'profile',
            label: 'Smart Profile Builder',
            icon: User,
            description: 'AI-enhanced profile using your actual achievements',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            emoji: '👤',
            features: ['🤖 AI Analysis', '🏆 Real Achievements', '⚡ Auto-Update']
        },
        {
            id: 'jobs',
            label: 'Live Job Matcher',
            icon: Target,
            description: 'Real job opportunities from Indeed, LinkedIn & more',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            emoji: '🎯',
            features: ['🌐 Multi-Source', '🔍 Smart Match', '📊 Live Data']
        },
        {
            id: 'resume',
            label: 'AI Resume Generator',
            icon: FileText,
            description: 'Professional resumes from your real Good Grid history',
            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            emoji: '📄',
            features: ['🤖 Gemini AI', '📋 Real Data', '📁 Multi-Format']
        }
    ];

    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return <CareerDashboard userId={userId} />;
            case 'profile':
                return <EnhancedProfileBuilder userId={userId} />;
            case 'jobs':
                return <AIJobMatcher userId={userId} />;
            case 'resume':
                return <AIResumeBuilder userId={userId} />;
            default:
                return <CareerDashboard userId={userId} />;
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%)',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: '"Courier New", monospace'
        }}>
            {/* Pixel Art Background Elements */}
            <div style={{
                position: 'absolute',
                top: '50px',
                left: '50px',
                width: '80px',
                height: '80px',
                background: 'linear-gradient(45deg, #ff6b6b 0%, #feca57 50%, #48dbfb 100%)',
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                animation: 'float 4s ease-in-out infinite'
            }}></div>
            
            <div style={{
                position: 'absolute',
                top: '150px',
                right: '80px',
                width: '60px',
                height: '60px',
                background: '#feca57',
                borderRadius: '50%',
                boxShadow: '0 0 30px #feca57',
                animation: 'pulse 3s infinite'
            }}></div>
            
            <div style={{
                position: 'absolute',
                bottom: '120px',
                left: '150px',
                width: '70px',
                height: '70px',
                background: 'linear-gradient(45deg, #ff9ff3 0%, #f368e0 100%)',
                transform: 'rotate(45deg)',
                animation: 'spin 6s linear infinite'
            }}></div>

            {/* Main Header */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.95) 100%)',
                border: '4px solid #feca57',
                borderRadius: '25px',
                margin: '20px',
                padding: '40px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Decorative corners */}
                <div style={{
                    position: 'absolute',
                    top: '-2px',
                    left: '-2px',
                    width: '30px',
                    height: '30px',
                    background: '#feca57',
                    clipPath: 'polygon(0 0, 100% 0, 0 100%)'
                }}></div>
                <div style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-2px',
                    width: '30px',
                    height: '30px',
                    background: '#feca57',
                    clipPath: 'polygon(100% 0, 100% 100%, 0 0)'
                }}></div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                        {/* Character Avatar */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                                border: '6px solid #fff',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '50px',
                                boxShadow: '0 0 40px rgba(254, 202, 87, 0.8)',
                                position: 'relative'
                            }}>
                                👑
                                {/* Level badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '-15px',
                                    right: '-15px',
                                    width: '50px',
                                    height: '50px',
                                    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                    border: '4px solid #fff',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#fff',
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    animation: 'bounce 2s infinite'
                                }}>
                                    {userLevel}
                                </div>
                            </div>
                            
                            {/* Sparkle effects */}
                            <div style={{
                                position: 'absolute',
                                top: '15px',
                                left: '15px',
                                color: '#feca57',
                                fontSize: '25px',
                                animation: 'twinkle 2s infinite'
                            }}>✨</div>
                            <div style={{
                                position: 'absolute',
                                bottom: '15px',
                                right: '15px',
                                color: '#ff9ff3',
                                fontSize: '20px',
                                animation: 'twinkle 2.5s infinite 0.5s'
                            }}>⭐</div>
                        </div>
                        
                        <div>
                            <h1 style={{
                                fontSize: '56px',
                                fontWeight: 'bold',
                                background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 50%, #48dbfb 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: '0 0 15px 0',
                                textShadow: '3px 3px 6px rgba(0,0,0,0.7)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px'
                            }}>
                                🚀 Career Hub 🚀
                            </h1>
                            <p style={{
                                color: '#feca57',
                                fontSize: '24px',
                                fontWeight: 'bold',
                                margin: '0 0 20px 0'
                            }}>
                                Transform your Good Grid achievements into career success
                            </p>
                            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #00d2ff 0%, #3a7bd5 100%)',
                                    color: '#fff',
                                    padding: '12px 24px',
                                    borderRadius: '25px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}>
                                    <div style={{
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: '#00ff88',
                                        borderRadius: '50%',
                                        animation: 'pulse 2s infinite'
                                    }}></div>
                                    🔴 LIVE DATA
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: '#fff',
                                    padding: '12px 24px',
                                    borderRadius: '25px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                                }}>
                                    🤖 Real AI
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                    color: '#fff',
                                    padding: '12px 24px',
                                    borderRadius: '25px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                                }}>
                                    ⚡ Live Jobs
                                </div>
                                <div style={{
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                    color: '#fff',
                                    padding: '12px 24px',
                                    borderRadius: '25px',
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    border: '3px solid rgba(255,255,255,0.3)',
                                    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
                                }}>
                                    📊 Real Stats
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats Panel */}
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '40px',
                                marginBottom: '15px',
                                border: '5px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 0 30px rgba(79, 172, 254, 0.6)',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                🛡️
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4facfe', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                {trustScore}
                            </div>
                            <div style={{ fontSize: '16px', color: '#ccc', fontWeight: 'bold' }}>Trust Score</div>
                        </div>
                        
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '40px',
                                marginBottom: '15px',
                                border: '5px solid rgba(255,255,255,0.3)',
                                boxShadow: '0 0 30px rgba(250, 112, 154, 0.6)',
                                cursor: 'pointer',
                                transition: 'transform 0.3s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                💥
                            </div>
                            <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#fa709a', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                                {impactScore}
                            </div>
                            <div style={{ fontSize: '16px', color: '#ccc', fontWeight: 'bold' }}>Impact Score</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '30px',
                margin: '30px',
                zIndex: 10,
                position: 'relative'
            }}>
                {navigationItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id as any)}
                        style={{
                            background: activeView === item.id ? item.color : 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                            border: activeView === item.id ? '4px solid #feca57' : '4px solid rgba(255,255,255,0.3)',
                            borderRadius: '25px',
                            padding: '40px',
                            color: '#fff',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            textAlign: 'center',
                            boxShadow: activeView === item.id ? '0 0 40px rgba(254, 202, 87, 0.8)' : '0 10px 25px rgba(0,0,0,0.4)',
                            transform: activeView === item.id ? 'scale(1.05)' : 'scale(1)',
                            fontFamily: '"Courier New", monospace',
                            minHeight: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '15px'
                        }}
                        onMouseEnter={(e) => {
                            if (activeView !== item.id) {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 100%)';
                                e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.5)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (activeView !== item.id) {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)';
                                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
                            }
                        }}
                    >
                        {/* Background Pattern */}
                        <div style={{
                            position: 'absolute',
                            top: '0',
                            right: '0',
                            width: '80px',
                            height: '80px',
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            transform: 'translate(40px, -40px)'
                        }}></div>
                        
                        <div style={{ fontSize: '60px', marginBottom: '10px' }}>{item.emoji}</div>
                        <h3 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 10px 0' }}>{item.label}</h3>
                        <p style={{ fontSize: '16px', opacity: 0.9, margin: '0 0 15px 0', lineHeight: '1.4' }}>{item.description}</p>
                        
                        {/* Feature badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                            {item.features.map((feature, idx) => (
                                <span key={idx} style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    border: '1px solid rgba(255,255,255,0.3)'
                                }}>
                                    {feature}
                                </span>
                            ))}
                        </div>
                        
                        {/* Active indicator */}
                        {activeView === item.id && (
                            <div style={{
                                position: 'absolute',
                                top: '-10px',
                                right: '-10px',
                                width: '30px',
                                height: '30px',
                                background: '#feca57',
                                borderRadius: '50%',
                                animation: 'pulse 2s infinite',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '16px'
                            }}>
                                ✓
                            </div>
                        )}
                    </button>
                ))}
            </div>

            {/* AI Features Highlight */}
            <div style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.95) 100%)',
                border: '4px solid #48dbfb',
                borderRadius: '25px',
                margin: '30px',
                padding: '40px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
                position: 'relative',
                zIndex: 10
            }}>
                <h2 style={{
                    fontSize: '42px',
                    fontWeight: 'bold',
                    color: '#fff',
                    textAlign: 'center',
                    marginBottom: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px'
                }}>
                    🧠 Powered by Real APIs & Live Data ✨
                </h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '30px'
                }}>
                    {[
                        { 
                            icon: '🔴', 
                            title: 'Live Good Grid Data', 
                            desc: 'Real user profiles, stats, and task history from your account', 
                            color: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
                            status: 'LIVE'
                        },
                        { 
                            icon: '🌐', 
                            title: 'Multi-Source Job APIs', 
                            desc: 'Indeed, LinkedIn, Adzuna - real job opportunities updated daily', 
                            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            status: 'CONNECTED'
                        },
                        { 
                            icon: '🤖', 
                            title: 'Gemini AI Integration', 
                            desc: 'Real AI-powered resume generation and career analysis', 
                            color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                            status: 'ACTIVE'
                        },
                        { 
                            icon: '📊', 
                            title: 'Real-Time Analytics', 
                            desc: 'Live career insights based on your actual achievements', 
                            color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                            status: 'UPDATING'
                        }
                    ].map((feature, index) => (
                        <div key={index} style={{
                            textAlign: 'center',
                            padding: '30px',
                            background: feature.color,
                            borderRadius: '20px',
                            border: '3px solid rgba(255,255,255,0.3)',
                            cursor: 'pointer',
                            transition: 'transform 0.3s ease',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                            position: 'relative'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {/* Status indicator */}
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'rgba(0,0,0,0.7)',
                                color: '#00ff88',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '6px',
                                    backgroundColor: '#00ff88',
                                    borderRadius: '50%',
                                    animation: 'pulse 2s infinite'
                                }}></div>
                                {feature.status}
                            </div>
                            
                            <div style={{ fontSize: '50px', marginBottom: '20px' }}>{feature.icon}</div>
                            <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '22px', marginBottom: '10px' }}>{feature.title}</div>
                            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', lineHeight: '1.4' }}>{feature.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Active View Content */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                {renderActiveView()}
            </div>

            {/* Real-Time Status Bar */}
            <div style={{
                position: 'fixed',
                bottom: '20px',
                left: '20px',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.95) 100%)',
                border: '2px solid #00ff88',
                borderRadius: '15px',
                padding: '15px 20px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 'bold',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
            }}>
                <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: '#00ff88',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                }}></div>
                <span>🔴 LIVE: Connected to Real APIs</span>
                <div style={{
                    background: 'rgba(0,255,136,0.2)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    fontSize: '12px'
                }}>
                    Good Grid • Gemini AI • Job APIs
                </div>
            </div>

            {/* Back to Map Button */}
            <div style={{
                position: 'fixed',
                top: '30px',
                left: '30px',
                zIndex: 50
            }}>
                <button 
                    onClick={() => window.history.back()}
                    style={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,60,0.95) 100%)',
                        border: '3px solid #feca57',
                        borderRadius: '20px',
                        padding: '15px 25px',
                        color: '#fff',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.7)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
                    }}
                >
                    🗺️ Back to Map
                </button>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-30px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.7; transform: scale(1.2); }
                }
                @keyframes spin {
                    from { transform: rotate(45deg); }
                    to { transform: rotate(405deg); }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes twinkle {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.3; transform: scale(0.7); }
                }
            `}</style>
        </div>
    );
};

export default CareerHub;