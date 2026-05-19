import React, { useState, useEffect } from "react";
import Sidebar from "../../components/user/Sidebar";
import RightSidebar from "../../components/user/RightSidebar";
import PostCard from "../../components/user/PostCard";
import ResumeAnalyzer from "../../components/user/ResumeAnalyzer";
import PostDisplayCard from "../../components/user/PostDisplayCard";
import "./Home.css";

const Home = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(false);

    return (
        <div className="container-fluid mt-3 home-container">
            <div className="row">
                {/* Left Sidebar */}
                <div className="col-lg-3 d-none d-lg-block sidebar-section">
                    {isLoading ? (
                        <div className="card p-3 shadow-sm border-0 mb-3" style={{ borderRadius: "16px" }}>
                            <div className="skeleton skeleton-pulse skeleton-circle mx-auto mb-3" style={{ width: "80px", height: "80px" }}></div>
                            <div className="skeleton skeleton-pulse skeleton-title mx-auto mb-2" style={{ width: "70%" }}></div>
                            <div className="skeleton skeleton-pulse skeleton-text mx-auto" style={{ width: "50%", height: "10px" }}></div>
                        </div>
                    ) : (
                        <Sidebar />
                    )}
                </div>

                {/* Center Section (Scrollable) */}
                <div className="col-lg-6 col-md-12 center-section">
                    <div className="scroll-container">
                        {isLoading ? (
                            <div className="card p-4 shadow-sm border-0 mb-4" style={{ borderRadius: "20px" }}>
                                <div className="d-flex align-items-center mb-3">
                                    <div className="skeleton skeleton-pulse skeleton-circle" style={{ width: "50px", height: "50px" }}></div>
                                    <div className="ms-3 flex-grow-1">
                                        <div className="skeleton skeleton-pulse skeleton-title mb-2" style={{ width: "40%" }}></div>
                                        <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "20%", height: "8px" }}></div>
                                    </div>
                                </div>
                                <div className="skeleton skeleton-pulse skeleton-text mb-2" style={{ width: "100%" }}></div>
                                <div className="skeleton skeleton-pulse skeleton-text mb-3" style={{ width: "90%" }}></div>
                                <div className="skeleton skeleton-pulse skeleton-rect" style={{ height: "200px", borderRadius: "12px" }}></div>
                            </div>
                        ) : (
                            <>
                                <PostCard onPostCreated={() => setRefreshTrigger(prev => !prev)} />
                                <PostDisplayCard refreshTrigger={refreshTrigger} />
                            </>
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="col-lg-3 d-none d-lg-block right-sidebar-section">
                    {isLoading ? (
                        <div className="card p-4 shadow-sm border-0" style={{ borderRadius: "16px" }}>
                            <div className="skeleton skeleton-pulse skeleton-title mb-3" style={{ width: "60%" }}></div>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="d-flex align-items-center mb-3">
                                    <div className="skeleton skeleton-pulse skeleton-circle me-3" style={{ width: "40px", height: "40px" }}></div>
                                    <div className="flex-grow-1">
                                        <div className="skeleton skeleton-pulse skeleton-text mb-1" style={{ width: "80%" }}></div>
                                        <div className="skeleton skeleton-pulse skeleton-text" style={{ width: "40%", height: "8px" }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <ResumeAnalyzer />
                            <RightSidebar />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Home;
