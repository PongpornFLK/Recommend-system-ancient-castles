"use client";

import {
    Search,
    MapPin,
    Github
} from "lucide-react";
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Divider,
    Image,
    Link,
    Chip,
} from "@heroui/react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            {/* Hero Section - Using a clean HeroUI approach */}
            <section className="relative h-[50vh] flex items-center justify-center bg-tone-oldgray overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-tone-orange/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-tone-orange/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="relative z-10 text-center px-6">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        ANCIENT <span className="text-tone-orange italic">CASTLES</span>
                    </h1>
                    <p className="text-lg text-stone-400 max-w-2xl mx-auto font-normal leading-relaxed">
                        ระบบแนะนำการท่องเที่ยวปราสาทโบราณโดยใช้ฐานข้อมูลเวกเตอร์
                    </p>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 space-y-32">

                {/* Mission Section */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-9 space-y-8">
                        <div className="space-y-4">
                            <h2 className="font-extrabold text-tone-oldgray tracking-tighter leading-tight">
                                <span className="text-xl md:text-3xl lg:text-4xl xl:text-[2.75rem] block whitespace-nowrap">
                                    A Recommender System for Ancient Castles
                                </span>
                                <span className="text-tone-orange text-xl md:text-3xl lg:text-4xl xl:text-[2.75rem] block whitespace-nowrap">
                                    Using Vector Database
                                </span>
                            </h2>
                            <Divider className="w-20 h-1 bg-tone-orange" />
                        </div>

                        <p className="text-xl text-stone-600 leading-relaxed font-light">
                            ใช้เทคโนโลยีฐานข้อมูลเวกเตอร์ (Vector Database) และแบบจำลองการแปลงข้อมูล (Embedding Model) เพื่อการจัดเก็บและค้นหาข้อมูลเชิงความหมาย พร้อมผสานระบบสารสนเทศทางภูมิศาสตร์ (GIS) สำหรับแสดงตำแหน่งและแนะนำเส้นทางการเดินทาง
                        </p>

                        <div className="space-y-6 pt-6">
                            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Tech Stack</h3>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    "Next.js 15",
                                    "HeroUI",
                                    "Tailwind CSS",
                                    "FastAPI",
                                    "Zilliz (Vector DB)",
                                    "PostgreSQL",
                                    "Google Maps API",
                                    "Groq (Llama 3)",
                                    "LangChain",
                                    "Python",
                                    "TypeScript",
                                    "Docker",
                                    "CI/CD Implementation"
                                ].map((tech, i) => (
                                    <Chip
                                        key={i}
                                        variant="flat"
                                        color="default"
                                        className="font-medium text-stone-600 bg-stone-100/80 border-none px-3"
                                    >
                                        {tech}
                                    </Chip>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3 relative group">
                        <div className="absolute -inset-4 bg-tone-orange/5 rounded-[40px] blur-2xl group-hover:bg-tone-orange/10 transition-colors"></div>
                        <Image
                            isBlurred
                            src="https://images.unsplash.com/photo-1596484552903-e84705599818?q=80&w=1000&auto=format&fit=crop"
                            alt="Ancient Castle Detail"
                            className="rounded-[32px] w-full aspect-[4/5] object-cover shadow-2xl relative z-10"
                        />
                    </div>
                </section>

                {/* Feature Cards Showcase */}
                <section className="space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-tone-oldgray uppercase tracking-widest leading-tight">Key Point</h2>
                        <p className="text-stone-500 max-w-xl mx-auto italic">จุดสำคัญของโครงงาน</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-8">
                        <Card isHoverable shadow="sm" className="p-4 border border-stone-100 max-w-sm">
                            <CardHeader className="flex flex-col items-start gap-4">
                                <div className="p-3 rounded-2xl bg-tone-oldgray text-white">
                                    <Search size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-tone-oldgray tracking-tight">AI Similarity Search</h3>
                            </CardHeader>
                            <CardBody className="pb-8">
                                <p className="text-stone-500 leading-6">
                                    ใช้โมเดล AI และ Vector Database (Zilliz) ในการคำนวณความคล้ายคลึงของปราสาทหิน เพื่อการแนะนำที่แม่นยำตามลักษณะทางสถาปัตยกรรม
                                </p>
                            </CardBody>
                        </Card>

                        <Card isHoverable shadow="sm" className="p-4 border border-stone-100 max-w-sm">
                            <CardHeader className="flex flex-col items-start gap-4">
                                <div className="p-3 rounded-2xl bg-tone-orange text-white">
                                    <MapPin size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-tone-oldgray tracking-tight">Google Maps Integration</h3>
                            </CardHeader>
                            <CardBody className="pb-8">
                                <p className="text-stone-500 leading-6">
                                    แสดงผลตำแหน่งและนำทางไปยังโบราณสถานผ่าน Google Maps API พร้อมระบบคำนวณเส้นทางที่เหมาะสมที่สุดสำหรับการท่องเที่ยว
                                </p>
                            </CardBody>
                        </Card>
                    </div>
                </section>

                {/* Our Team Section */}
                <section className="space-y-16 py-10">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-tone-oldgray uppercase tracking-widest leading-tight">Our Team</h2>
                        <p className="text-stone-500 max-w-xl mx-auto italic">ทีมของเรา</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-10">
                        {[
                            { name: "PONGPORN YAMPRADIT", id: "6504062620078", edu: "KMUTNB-CS" },
                            { name: "NATTHAPAT CHANAPOL", id: "6404062630074", edu: "KMUTNB-CS" },
                        ].map((member, i) => (
                            <Card key={i} shadow="none" className="bg-transparent group border-none max-w-[300px] text-center">

                                <CardBody className="space-y-2 pt-6">
                                    <h4 className="text-xl font-bold text-tone-oldgray leading-tight">{member.name}</h4>
                                    <div className="flex flex-row items-center justify-center gap-4">
                                        <p className="text-tone-orange font-bold text-xs uppercase tracking-widest">{member.id}</p>
                                        <span className="text-stone-500 text-sm font-light leading-relaxed">{member.edu}</span>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </section>
            </div>

            {/* Modern Footer Area */}
            <footer className="bg-white py-16 px-10 border-t border-stone-100 mt-20">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-tone-orange flex items-center justify-center text-white font-bold">A</div>
                            <span className="text-xl font-black text-tone-oldgray tracking-tighter uppercase">Ancient Castles</span>
                        </div>
                        <p className="text-stone-400 text-sm max-w-xs">A Recommender System for Ancient Castles Using Vector Database</p>
                    </div>

                    <div className="flex flex-wrap gap-8">
                        <Link href="/landing" className="text-stone-600 hover:text-tone-orange font-medium text-sm">HOME</Link>
                        <Link href="/about" className="text-tone-orange font-bold text-sm">ABOUT</Link>
                        <Link href="/history" className="text-stone-600 hover:text-tone-orange font-medium text-sm">HISTORY</Link>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            isIconOnly
                            as={Link}
                            href="https://github.com/PongpornFLK/Recommend-system-ancient-castles.git"
                            target="_blank"
                            variant="flat"
                            className="rounded-full bg-stone-100 text-stone-600 hover:text-tone-orange hover:bg-orange-50 transition-colors"
                        >
                            <Github size={18} />
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}
