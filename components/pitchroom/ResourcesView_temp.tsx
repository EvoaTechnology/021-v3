"use client";

import React, { useState } from "react";
import { Star, ArrowRight, User, Clock, BookOpen, Activity } from "lucide-react";

export default function ResourcesView() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedType, setSelectedType] = useState("All Types");

    const featuredResources = [
        {
            title: "How to Start a Startup - Sam Altman (Stanford)",
            author: "Sam Altman",
            rating: 4.9,
            level: "Beginner",
            url: "https://www.youtube.com/playlist?list=PL5q_lef6zVkaTY_cT1k7qFNF2TidHCe-1",
            icon: <BookOpen className="h-5 w-5" />
        },
        {
            title: "The Lean Startup Methodology - Steve Blank",
            author: "Steve Blank",
            rating: 4.8,
            level: "Intermediate",
            url: "https://steveblank.com/category/lean-launchpad/",
            icon: <Activity className="h-5 w-5" />
        },
        {
            title: "Zero to One - Peter Thiel",
            author: "Peter Thiel",
            rating: 4.6,
            level: "Intermediate",
            url: "https://www.amazon.com/Zero-One-Notes-Startups-Future/dp/0804139296",
            icon: <BookOpen className="h-5 w-5" />
        },
        {
            title: "The Lean Startup - Eric Ries",
            author: "Eric Ries",
            rating: 4.5,
            level: "Beginner",
            url: "https://www.amazon.com/Lean-Startup-Entrepreneurs-Continuous-Innovation/dp/0307887898",
            icon: <BookOpen className="h-5 w-5" />
        },
        {
            title: "Guy Kawasaki's Pitch Deck Template",
            author: "Guy Kawasaki",
            rating: 4.6,
            level: "Intermediate",
            url: "https://guykawasaki.com/the-only-10-slides-you-need-in-your-pitch/",
            icon: <Star className="h-5 w-5" />
        }
    ];

    const allResources = [
        {
            title: "How to Start a Startup - Sam Altman (Stanford)",
            author: "Sam Altman",
            description: "Complete startup course from Y Combinator covering everything from idea validation to scaling.",
            rating: 4.9,
            views: "2.5M",
            duration: "20 hours",
            category: "Course",
            level: "Beginner",
            url: "https://www.youtube.com/playlist?list=PL5q_lef6zVkaTY_cT1k7qFNF2TidHCe-1"
        },
        {
            title: "The Lean Startup Methodology - Steve Blank",
            author: "Steve Blank",
            description: "Learn the customer development process and how to build products customers actually want.",
            rating: 4.8,
            views: "1.8M",
            duration: "8 hours",
            category: "Course",
            level: "Intermediate",
            url: "https://www.youtube.com/watch?v=QoAOzMTLP5s"
        },
        {
            title: "Fundraising Masterclass - Jason Calacanis",
            author: "Jason Calacanis",
            description: "Complete guide to raising capital from angel investors and VCs.",
            rating: 4.7,
            views: "1.6M",
            duration: "12 hours",
            category: "Fundraising",
            level: "Advanced",
            url: "https://www.youtube.com/watch?v=EHtvTGaPzF4"
        },
        {
            title: "Zero to One - Peter Thiel",
            author: "Peter Thiel",
            description: "Notes on startups and how to build the future. Essential reading for any entrepreneur.",
            rating: 4.6,
            views: "5.5M",
            duration: "",
            category: "Book",
            level: "Intermediate",
            url: "https://www.youtube.com/watch?v=rFZrL1RiuVI"
        },
        {
            title: "The Lean Startup - Eric Ries",
            author: "Eric Ries",
            description: "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
            rating: 4.5,
            views: "3.1M",
            duration: "",
            category: "Book",
            level: "Beginner",
            url: "https://www.youtube.com/watch?v=fEvKo90qBns"
        },
        {
            title: "Venture Deals - Brad Feld & Jason Mendelson",
            author: "Brad Feld",
            description: "Be smarter than your lawyer and venture capitalist when negotiating deals.",
            rating: 4.7,
            views: "1.1M",
            duration: "",
            category: "Fundraising",
            level: "Advanced",
            url: "https://www.youtube.com/watch?v=2Th8JhUvHKY"
        },
        {
            title: "Business Model Canvas Template",
            author: "Strategyzer",
            description: "Interactive template to design and visualize your business model.",
            rating: 4.8,
            views: "2.7M",
            duration: "",
            category: "Template",
            level: "Beginner",
            url: "https://www.strategyzer.com/library/the-business-model-canvas"
        },
        {
            title: "Guy Kawasaki's Pitch Deck Template",
            author: "Guy Kawasaki",
            description: "The famous 10/20/30 rule pitch deck template from Guy Kawasaki.",
            rating: 4.6,
            views: "1.9M",
            duration: "",
            category: "Template",
            level: "Intermediate",
            url: "https://www.youtube.com/watch?v=liQLdRk0Ziw"
        },
        {
            title: "Financial Model Template for Startups",
            author: "Y Combinator",
            description: "Comprehensive Excel template for startup financial planning and projections.",
            rating: 4.5,
            views: "890K",
            duration: "",
            category: "Template",
            level: "Advanced",
            url: "https://www.ycombinator.com/library/7y-startup-financial-models"
        },
        {
            title: "Y Combinator Startup Library",
            author: "Y Combinator",
            description: "Free library of startup advice, templates, and resources from the world's top accelerator.",
            rating: 4.9,
            views: "5.2M",
            duration: "",
            category: "Library",
            level: "All Levels",
            url: "https://www.ycombinator.com/library"
        },
        {
            title: "How to Pitch Your Startup - Y Combinator",
            author: "Y Combinator",
            description: "Master the art of pitching with insights from YC partners and successful founders.",
            rating: 4.8,
            views: "2.1M",
            duration: "45 min",
            category: "Video",
            level: "Intermediate",
            url: "https://www.youtube.com/watch?v=17XZGUX_9iM"
        },
        {
            title: "Sequoia Capital Pitch Deck Template",
            author: "Sequoia Capital",
            description: "The legendary pitch deck template used by Airbnb, Dropbox, and other unicorns.",
            rating: 4.7,
            views: "3.3M",
            duration: "",
            category: "Template",
            level: "Intermediate",
            url: "https://www.sequoiacap.com/article/writing-a-business-plan/"
        }
    ];

    const filteredResources = allResources.filter(resource => {
        const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
            resource.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || resource.category === selectedCategory;
        const matchesType = selectedType === "All Types" || resource.level === selectedType;
        return matchesSearch && matchesCategory && matchesType;
    });

    const getLevelColor = (level: string) => {
        switch (level) {
            case "Beginner": return "bg-green-500/10 text-green-500";
            case "Intermediate": return "bg-yellow-500/10 text-yellow-500";
            case "Advanced": return "bg-red-500/10 text-red-500";
            default: return "bg-blue-500/10 text-blue-500";
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Featured Resources */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <h2 className="text-xl font-bold">Featured Resources</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredResources.map((resource, idx) => (
                        <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-200 flex flex-col"
                        >
                            <div className="flex items-start gap-3 mb-3 flex-1">
                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                    {resource.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                        <span className="text-xs font-medium">{resource.rating}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${getLevelColor(resource.level)}`}>
                                            {resource.level}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-blue-500 transition-colors">
                                        {resource.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">by {resource.author}</p>
                                </div>
                            </div>
                            <button className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-muted to-muted/80 text-foreground text-sm font-medium hover:from-green-500 hover:to-green-600 hover:text-white transition-colors flex items-center justify-center gap-2 mt-auto">
                                <ArrowRight className="h-4 w-4" />
                                Access
                            </button>
                        </a>
                    ))}
                </div>
            </div>

            {/* All Resources Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">All Resources</h2>
                    <span className="text-sm text-muted-foreground">{filteredResources.length} resources</span>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search resources, authors, or topics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-foreground/20 transition-colors"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-foreground/20 transition-colors cursor-pointer"
                    >
                        <option>All</option>
                        <option>Course</option>
                        <option>Book</option>
                        <option>Template</option>
                        <option>Video</option>
                        <option>Fundraising</option>
                        <option>Library</option>
                    </select>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-4 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:border-foreground/20 transition-colors cursor-pointer"
                    >
                        <option>All Types</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>All Levels</option>
                    </select>
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredResources.map((resource, idx) => (
                        <a
                            key={idx}
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-200 flex flex-col"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${getLevelColor(resource.level)}`}>
                                    {resource.level}
                                </span>
                                <Star className="h-4 w-4 text-muted-foreground group-hover:text-yellow-500 transition-colors cursor-pointer" />
                            </div>

                            <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-blue-500 transition-colors">
                                {resource.title}
                            </h3>

                            <p className="text-xs text-muted-foreground mb-1">by {resource.author}</p>

                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                                {resource.description}
                            </p>

                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                                    <span>{resource.rating}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>{resource.views} views</span>
                                </div>
                                {resource.duration && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{resource.duration}</span>
                                    </div>
                                )}
                            </div>

                            <button className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-muted to-muted/80 text-foreground text-sm font-medium hover:from-green-500 hover:to-green-600 hover:text-white transition-colors flex items-center justify-center gap-2">
                                <ArrowRight className="h-4 w-4" />
                                Access Resource
                            </button>
                        </a>
                    ))}
                </div>

                {filteredResources.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No resources found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
