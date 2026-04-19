"use client";

import {
    Search,
    MapPin,
    Github,
    Route,
    Navigation,
    History
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

                {/* User Manual Section */}
                <section className="space-y-16 py-10 relative">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-tone-orange/5 blur-3xl rounded-full z-0 pointer-events-none"></div>
                    
                    <div className="text-center space-y-4 relative z-10">
                        <h2 className="text-3xl font-bold text-tone-oldgray uppercase tracking-widest leading-tight">How to Use</h2>
                        <p className="text-stone-500 max-w-xl mx-auto italic">รายละเอียดการใช้งานระบบทีละขั้นตอน</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 max-w-5xl mx-auto">
                        {/* Step 1 */}
                        <Card shadow="sm" className="p-8 border border-stone-100 bg-white/80 backdrop-blur-md hover:border-tone-orange/50 transition-all duration-300 group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-tone-orange/10 flex items-center justify-center shrink-0 text-tone-orange group-hover:bg-tone-orange group-hover:text-white transition-all duration-500">
                                    <Search size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-tone-oldgray mb-1">1. ค้นหาและสำรวจ</h3>
                                    <p className="text-stone-400 text-sm">การค้นหาเป้าหมายด้วย AI</p>
                                </div>
                            </div>
                            <div className="space-y-3 pl-0 md:pl-[72px]">
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>ค้นหาด้วยภาพ (Image Search) 🌟:</b> อัปโหลดรูปปราสาทที่คุณสนใจ ระบบ AI ของเราจะเทียบเคียงและหาปราสาทที่มีสถาปัตยกรรมคล้ายคลึงให้ทันที</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>ค้นหาด้วยข้อความ:</b> ค้นหาจากชื่อ ยุคสมัย หรือประวัติศาตร์</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>ระบบแนะนำ (Recommendation):</b> การประมวลผลความชอบเพื่อแสดงปราสาทที่ใกล้เคียงกับความสนใจของคุณ</span>
                                </p>
                            </div>
                        </Card>

                        {/* Step 2 */}
                        <Card shadow="sm" className="p-8 border border-stone-100 bg-white/80 backdrop-blur-md hover:border-tone-orange/50 transition-all duration-300 group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-tone-orange/10 flex items-center justify-center shrink-0 text-tone-orange group-hover:bg-tone-orange group-hover:text-white transition-all duration-500">
                                    <Route size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-tone-oldgray mb-1">2. วางแผนทริป</h3>
                                    <p className="text-stone-400 text-sm">สร้างสรรค์แผนการเดินทาง</p>
                                </div>
                            </div>
                            <div className="space-y-3 pl-0 md:pl-[72px]">
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>จัดเส้นทางอัตโนมัติ (Route Optimization) 🌟:</b> ใช้เทคโนโลยีขั้นสูงเรียงลำดับเส้นทางที่สั้นและคุ้มเวลาการเดินทางที่สุดให้คุณ</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>เพิ่มละปรับแต่ง:</b> สามารถจัดการลบ/เพิ่ม/แก้ชื่อ ทริปและรายการปราสาทได้ตลอดเวลา</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>บันทึกแบบร่าง:</b> แพลนของคุณจะไม่มีวันหายจนกว่าคุณจะกดลบเอง</span>
                                </p>
                            </div>
                        </Card>

                        {/* Step 3 */}
                        <Card shadow="sm" className="p-8 border border-stone-100 bg-white/80 backdrop-blur-md hover:border-tone-orange/50 transition-all duration-300 group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-tone-orange/10 flex items-center justify-center shrink-0 text-tone-orange group-hover:bg-tone-orange group-hover:text-white transition-all duration-500">
                                    <Navigation size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-tone-oldgray mb-1">3. นำทาง & ติดตาม</h3>
                                    <p className="text-stone-400 text-sm">ระบบช่วยเหลือการเดินทาง</p>
                                </div>
                            </div>
                            <div className="space-y-3 pl-0 md:pl-[72px]">
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>Live Tracking Mode:</b> คอยติดตามสถานการณ์เดินทางของคุณแบบ Step-by-Step พร้อมระบบนำทาง Google Maps แบบฝังตัวใน UI</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>ระยะทาง & เวลาจริง:</b> อัปเดตข้อมูลระยะห่างจากตัวคุณกับโบราณสถานเป้าหมายตลอดเวลา</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>ระบบ Check-In:</b> กดเช็คอิน ณ สถานที่จริงเพื่อปลดล็อกขั้นต่อไปของการดินทาง</span>
                                </p>
                            </div>
                        </Card>

                        {/* Step 4 */}
                        <Card shadow="sm" className="p-8 border border-stone-100 bg-white/80 backdrop-blur-md hover:border-tone-orange/50 transition-all duration-300 group">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-tone-orange/10 flex items-center justify-center shrink-0 text-tone-orange group-hover:bg-tone-orange group-hover:text-white transition-all duration-500">
                                    <History size={28} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-tone-oldgray mb-1">4. บันทึกความทรงจำ</h3>
                                    <p className="text-stone-400 text-sm">จัดเก็บและแสดงข้อมูลย้อนหลัง</p>
                                </div>
                            </div>
                            <div className="space-y-3 pl-0 md:pl-[72px]">
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>ประวัติการเดินทาง (History):</b> เมื่อทริปสิ้นสุดและ Check-in ครบ ข้อมูลทุกอย่างจะถูกแปลงเป็น "ความทรงจำบันทึก" อัตโนมัติ</span>
                                </p>
                                <p className="text-stone-600 text-sm leading-relaxed flex items-start gap-2">
                                    <span className="text-tone-orange mt-0.5">•</span> 
                                    <span><b>สถานที่ที่ชอบ (Favorites):</b> สามารถกด ❤️ ที่หน้าปราสาท เพื่อเก็บเข้าคอลเล็กชันส่วนตัว เพื่อย่นระยะเวลาการหาข้อมูลในอนาคต</span>
                                </p>
                            </div>
                        </Card>
                    </div>
                </section>

                {/* Tech Stack Section */}
                <section className="space-y-10 py-10">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-tone-oldgray uppercase tracking-widest leading-tight">Tech Stack</h2>
                        <p className="text-stone-500 max-w-xl mx-auto italic">เทคโนโลยีที่ใช้พัฒนา</p>
                    </div>
                    <div className="flex flex-wrap justify-center max-w-3xl mx-auto gap-4">
                        {[
                            "Next.js 15", "HeroUI", "Tailwind CSS", "FastAPI",
                            "Zilliz (Vector DB)", "PostgreSQL", "Google Maps API",
                            "Groq (Llama 3)", "LangChain", "Python", "TypeScript",
                            "Docker", "CI/CD Implementation"
                        ].map((tech, i) => (
                            <Chip key={i} variant="flat" color="default" className="font-medium text-stone-600 bg-stone-100/80 border-none px-4 py-2">
                                {tech}
                            </Chip>
                        ))}
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


                {/* Data Sources Section */}
                <section className="space-y-10 py-10 border-t border-stone-100">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl font-bold text-tone-oldgray uppercase tracking-widest leading-tight">Data Sources</h2>
                        <p className="text-stone-500 max-w-xl mx-auto italic">แหล่งที่มาและการอ้างอิงข้อมูล</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pb-4">
                        {/* 1. Historical Data */}
                        <Card shadow="none" className="p-6 border border-stone-100 bg-stone-50/50">
                            <h3 className="text-xl font-bold text-tone-oldgray mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded bg-tone-orange/10 flex items-center justify-center text-tone-orange text-base">🏛️</span>
                                ข้อมูลเชิงประวัติศาสตร์
                            </h3>
                            <div className="space-y-4 pl-3 border-l-2 border-tone-orange/30">
                                <div className="flex flex-col">
                                    <span className="font-bold text-stone-700">กรมศิลปากร</span>
                                    <a href="https://www.finearts.go.th/" target="_blank" rel="noopener noreferrer" className="text-sm text-stone-500 hover:text-tone-orange transition-colors underline decoration-stone-200 underline-offset-4">
                                        www.finearts.go.th
                                    </a>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-stone-700">ศูนย์มานุษยวิทยาสิรินธร</span>
                                    <a href="https://www.sac.or.th/" target="_blank" rel="noopener noreferrer" className="text-sm text-stone-500 hover:text-tone-orange transition-colors underline decoration-stone-200 underline-offset-4">
                                        www.sac.or.th
                                    </a>
                                </div>
                            </div>
                        </Card>

                        {/* 2. Map & Geospatial Data */}
                        <Card shadow="none" className="p-6 border border-stone-100 bg-stone-50/50">
                            <h3 className="text-xl font-bold text-tone-oldgray mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded bg-tone-orange/10 flex items-center justify-center text-tone-orange text-base">📍</span>
                                พิกัดและแผนที่
                            </h3>
                            <div className="space-y-4 pl-3 border-l-2 border-tone-orange/30">
                                <div className="flex flex-col">
                                    <span className="font-bold text-stone-700">Google Maps API</span>
                                    <span className="text-sm text-stone-500">ระบบนำทางและแสดงผลข้อมูลเชิงพื้นที่</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-stone-700">GPS Coordinates</span>
                                    <a href="https://www.gps-coordinates.net/" target="_blank" rel="noopener noreferrer" className="text-sm text-stone-500 hover:text-tone-orange transition-colors underline decoration-stone-200 underline-offset-4">
                                        www.gps-coordinates.net
                                    </a>
                                </div>
                            </div>
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
