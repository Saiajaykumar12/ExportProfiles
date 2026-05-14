import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link2, LogOut, ExternalLink, Globe, User, UserPlus, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface LinkItem {
  id: number;
  url: string;
  title: string;
  type: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUser();
    fetchLinks();
  }, [navigate]);

  const fetchUser = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/user", {
        credentials: "include"
      });
      const data = await res.json();
      if (!data.user) {
        navigate("/");
      } else {
        setUser(data.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      navigate("/");
    }
  };

  const fetchLinks = async () => {
    try {
      setIsLoadingLinks(true);
      const res = await fetch("http://localhost:8081/api/links", {
        credentials: "include"
      });
      const data = await res.json();
      if (data.links) {
        setLinks(data.links);
      }
    } catch (error) {
      console.error("Error fetching links:", error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost:8081/logout", {
      method: "GET",
      credentials: "include"
    });
    navigate("/");
  };

  const handleUseAnotherAccount = () => {
    window.location.href = "http://localhost:8081/auth/google/choose";
  };

  const handleDeleteLink = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:8081/api/links/${id}`, {
        method: "DELETE",
        credentials: "include"
      });
      if (res.ok) {
        setLinks(links.filter(l => l.id !== id));
        toast({
          title: "Deleted",
          description: "Link has been removed successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (link: LinkItem) => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "User email not found",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Processing Download",
        description: "Generating your CSV file...",
      });

      // Use your backend's new endpoint
      const response = await fetch(`http://localhost:8081/api/download/${link.id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to generate CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `profile_data_${link.id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Download started successfully",
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 h-20 flex items-center border-b border-gray-100">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate("/dashboard")}>
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">ExportProfileMiner</span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden border border-gray-200 hover:border-primary transition-all shadow-sm">
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user?.photo} alt={user?.displayName || "User"} />
                    <AvatarFallback className="bg-gray-50 text-primary font-bold">
                      {user?.displayName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 p-2 rounded-xl bg-white shadow-xl border border-gray-100" align="end">
                <DropdownMenuLabel className="p-3">
                  <div className="flex flex-col space-y-0.5">
                    <p className="text-sm font-bold text-gray-900">{user?.displayName}</p>
                    <p className="text-xs font-medium text-gray-500 truncate italic">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem className="gap-2.5 p-2 rounded-lg cursor-pointer text-sm font-medium text-gray-700 hover:bg-primary/10 hover:text-primary transition-colors">
                  <User className="w-4 h-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2.5 p-2 rounded-lg cursor-pointer text-sm text-primary font-medium hover:bg-primary/10 transition-colors" onClick={handleUseAnotherAccount}>
                  <UserPlus className="w-4 h-4" />
                  <span>Switch Account</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-100" />
                <DropdownMenuItem className="gap-2.5 p-2 rounded-lg cursor-pointer text-sm text-red-600 font-medium hover:bg-red-50 transition-colors" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">
        <h1 className="text-3xl font-black text-gray-900 mb-10">Dashboard</h1>

        <div className="space-y-12">
          {/* Links Table Area */}
          <div className="border-2 border-primary/20 p-8 bg-white shadow-lg rounded-lg relative min-h-[500px]">
            <div className="flex flex-col mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black uppercase tracking-tighter">Your Archived Links</h2>
                <Button
                  onClick={() => {
                    if (links.length >= 5) {
                      toast({
                        title: "Limit Reached",
                        description: "You can only add up to 5 links per account.",
                        variant: "destructive",
                      });
                      return;
                    }
                    navigate("/submit");
                  }}
                  className="bg-primary text-white font-black px-6 py-6 hover:bg-primary/90 transition-colors rounded-md shadow-md"
                  disabled={links.length >= 5}
                >
                  Extract New Profile
                </Button>
                {links.length >= 5 && (
                  <div className="text-xs text-red-500 font-bold mt-2">You have reached the maximum of 5 links per account.</div>
                )}
              </div>

              <div className="grid grid-cols-[60px_1fr_150px_150px_180px_120px_120px_120px] gap-4 w-full text-xs font-black text-gray-800 border-b-2 border-primary pb-4 uppercase tracking-widest bg-primary/5 p-2 rounded-md">
                <div>SNO</div>
                <div>LINK</div>
                <div className="text-center">FIRST NAME</div>
                <div className="text-center">LAST NAME</div>
                <div className="text-center">TYPE</div>
                <div className="text-center">TIME</div>
                <div className="text-center">DATE</div>
                <div className="text-right">DOWNLOAD</div>
              </div>
            </div>

            <div className="mt-4 space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingLinks ? (
                <div className="flex justify-center py-20">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : links.length > 0 ? (
                links.map((link, index) => (
                  <div key={link.id} className="grid grid-cols-[60px_1fr_150px_150px_180px_120px_120px_120px] gap-4 items-center text-sm text-gray-700 py-4 hover:bg-primary/5 rounded-md border-b border-gray-100 px-2 transition-colors group">
                    <div className="font-black text-gray-300 group-hover:text-primary transition-colors">#{links.length - index}</div>
                    <div className="truncate pr-4">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary font-bold hover:underline flex items-center gap-2 truncate"
                        title={link.url}
                      >
                        {link.url}
                        <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <div className="text-center font-bold text-gray-700">{link.firstName || '-'}</div>
                    <div className="text-center font-bold text-gray-700">{link.lastName || '-'}</div>
                    <div className="text-center">
                      <span className="inline-block px-3 py-1 bg-gray-100 text-[10px] font-black uppercase tracking-widest rounded-full text-gray-600 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {link.type}
                      </span>
                    </div>
                    <div className="text-center font-bold text-gray-500">{new Date(link.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })}</div>
                    <div className="text-center font-bold text-gray-500">{new Date(link.createdAt).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                    <div className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(link, index)}
                        className="p-1 h-auto text-primary font-black hover:text-white hover:bg-primary transition-all rounded-md flex items-center gap-2 ml-auto"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-32 border-4 border-dashed border-gray-100 rounded-md bg-gray-50/30">
                  <Globe className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-black uppercase tracking-widest">No profiles extracted yet</p>
                  <Button
                    variant="link"
                    onClick={() => navigate("/submit")}
                    className="text-primary font-bold mt-2"
                  >
                    Start extracting profiles &rarr;
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-12 text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
              Profile Data Archive - Name, Type, Time, Date
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-10 border-t border-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900 tracking-tight">ExportProfileMiner &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse italic">
            System Status: Active
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
