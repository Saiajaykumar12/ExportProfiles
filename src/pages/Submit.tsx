import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link2, LogOut, ArrowLeft, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Function to extract name from URL
const extractNameFromUrl = (url: string): { firstName: string; lastName: string } => {
    try {
        // Handle various URL formats:
        // https://www.example.com/in/john-doe-123456/
        // https://example.com/in/jane-smith
        // https://www.example.com/in/saiajaykumar/

        // For Sales Navigator URLs
        const salesNavMatch = url.match(/firstName:([^,)]+).*lastName:([^,)]+)/);
        if (salesNavMatch) {
            return {
                firstName: salesNavMatch[1].trim(),
                lastName: salesNavMatch[2].trim()
            };
        }

        // For standard profile URLs - look for /in/ pattern
        const profileMatch = url.match(/\/in\/([^/?]+)/);
        if (profileMatch) {
            const slug = profileMatch[1];
            // Remove trailing numbers and split by hyphens
            const cleanSlug = slug.replace(/-\d+$/, '');
            const nameParts = cleanSlug.split('-');

            if (nameParts.length >= 2) {
                // Standard hyphenated name: john-doe
                const firstName = nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1);
                const lastName = nameParts[nameParts.length - 1].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].slice(1);
                return { firstName, lastName };
            } else if (nameParts.length === 1) {
                const singleName = nameParts[0];

                // 1. Try camelCase (e.g. saiajayKumar)
                const camelCaseMatch = singleName.match(/^([a-z]+)([A-Z][a-z]+.*)/);
                if (camelCaseMatch) {
                    const firstName = camelCaseMatch[1].charAt(0).toUpperCase() + camelCaseMatch[1].slice(1);
                    const lastName = camelCaseMatch[2].charAt(0).toUpperCase() + camelCaseMatch[2].slice(1);
                    return { firstName, lastName };
                }

                // 2. Try common name suffixes (e.g. saiajaykumar)
                const commonSuffixes = [
                    'kumar', 'singh', 'patel', 'sharma', 'gupta',
                    'smith', 'jones', 'doe', 'brown', 'wilson',
                    'reddy', 'rao', 'nair', 'iyer', 'khan',
                    'ali', 'ahmed', 'shah', 'jain', 'das'
                ];

                for (const suffix of commonSuffixes) {
                    if (singleName.toLowerCase().endsWith(suffix) && singleName.length > suffix.length) {
                        const splitIndex = singleName.length - suffix.length;
                        const first = singleName.substring(0, splitIndex);
                        const last = singleName.substring(splitIndex);

                        const firstName = first.charAt(0).toUpperCase() + first.slice(1);
                        const lastName = last.charAt(0).toUpperCase() + last.slice(1);
                        return { firstName, lastName };
                    }
                }

                // 3. Fallback: Use capitalized full name as First Name, empty Last Name
                const capitalizedName = singleName.charAt(0).toUpperCase() + singleName.slice(1);
                return { firstName: capitalizedName, lastName: '' };
            }
        }

        return { firstName: '', lastName: '' };
    } catch (error) {
        console.error('Error parsing URL:', error);
        return { firstName: '', lastName: '' };
    }
};

const Submit = () => {
    const [newUrl, setNewUrl] = useState("");
    const [linkType, setLinkType] = useState("Basic URL");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [extractedName, setExtractedName] = useState({ firstName: '', lastName: '' });
    const [userEmail, setUserEmail] = useState("");
    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        fetchUser();
    }, [navigate]);

    // Extract name whenever URL changes
    useEffect(() => {
        if (newUrl) {
            const { firstName, lastName } = extractNameFromUrl(newUrl);
            setExtractedName({ firstName, lastName });
        } else {
            setExtractedName({ firstName: '', lastName: '' });
        }
    }, [newUrl]);

    const fetchUser = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/user", {
                credentials: "include"
            });
            const data = await res.json();

            if (!data.user) {
                navigate("/");
            } else {
                setUserEmail(data.user.email);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            navigate("/");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newUrl) {
            toast({
                title: "Missing URL",
                description: "Please enter a profile URL",
                variant: "destructive",
            });
            return;
        }

        const { firstName, lastName } = extractedName;
        // Use fallbacks if name extraction failed
        const finalFirstName = firstName || "User";
        const finalLastName = lastName || "";

        setIsSubmitting(true);
        try {
            // Fetch current link count to determine Serial Number
            let serialNumber = 1;
            try {
                const linkRes = await fetch("http://localhost:4000/api/links", {
                    credentials: "include"
                });
                const linkData = await linkRes.json();
                if (linkData.links) {
                    serialNumber = linkData.links.length + 1;
                }
            } catch (err) {
                console.error("Error fetching link count:", err);
            }

            // Trigger Webhook
            try {
                fetch("http://localhost:5678/webhook/linkedin-search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: userEmail,
                        type: linkType,
                        url: newUrl,
                        serialNumber: serialNumber
                    })
                }).catch(err => console.error("Webhook trigger failed:", err));
            } catch (webhookError) {
                console.error("Error triggering webhook:", webhookError);
            }

            const res = await fetch("http://localhost:4000/api/links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: newUrl,
                    type: linkType,
                    firstName: finalFirstName,
                    lastName: finalLastName
                }),
                credentials: "include",
            });

            const data = await res.json();

            if (res.ok) {
                toast({
                    title: "Data Processing",
                    description: "Your data is processing, kindly wait for sometime",
                });
                // Small delay to show the toast before redirecting
                setTimeout(() => {
                    navigate("/dashboard");
                }, 1000);
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to process profile",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 bg-gray-50/50">
            <div className="w-full max-w-2xl space-y-8">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/dashboard")}
                        className="group font-bold text-gray-500 hover:text-primary"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                            <Link2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-gray-900">ExportProfileMiner</span>
                    </div>
                </div>

                <div className="bg-white border-2 border-primary/20 p-10 shadow-lg rounded-lg">
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-gray-900 mb-2">Submit Profile URL</h1>
                        <p className="text-gray-500 text-sm">Paste a profile URL to extract and store data</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="space-y-6">
                            <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Select Link Type</Label>
                            <RadioGroup
                                defaultValue="Basic URL"
                                onValueChange={setLinkType}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                <div className="flex items-center space-x-4 border-2 border-gray-100 p-4 hover:border-primary transition-colors cursor-pointer group rounded-md">
                                    <RadioGroupItem value="Basic URL" id="basic" className="h-6 w-6 border-2 border-primary" />
                                    <Label htmlFor="basic" className="text-base font-bold text-black cursor-pointer flex-1">Basic URL</Label>
                                </div>
                                <div className="flex items-center space-x-4 border-2 border-gray-100 p-4 hover:border-primary transition-colors cursor-pointer group rounded-md">
                                    <RadioGroupItem value="Advanced URL" id="advanced" className="h-6 w-6 border-2 border-primary" />
                                    <Label htmlFor="advanced" className="text-base font-bold text-black cursor-pointer flex-1">Advanced URL</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-black uppercase tracking-widest text-gray-400">Profile URL *</Label>
                            <Input
                                placeholder="https://www.example.com/in/username"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="h-16 text-lg border-2 border-gray-200 rounded-md focus:border-primary transition-colors px-6"
                                required
                            />
                            {extractedName.firstName && extractedName.lastName && (
                                <p className="text-sm text-primary font-semibold mt-2">
                                    ✓ Detected: {extractedName.firstName} {extractedName.lastName}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting || !newUrl}
                            className="w-full h-20 bg-primary text-white text-2xl font-black hover:bg-primary/90 transition-all rounded-md shadow-lg active:translate-y-1 flex items-center justify-center gap-3"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </form>
                </div>

                <p className="text-center text-gray-400 font-bold text-sm italic">
                    Profile data is automatically extracted from URLs and stored securely.
                </p>
            </div>
        </div>
    );
};

export default Submit;
