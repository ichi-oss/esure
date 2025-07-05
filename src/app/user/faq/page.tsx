"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How do I view my policy details?",
    answer:
      "You can view your policy details by tapping on any policy card from your dashboard. This will show you comprehensive information about your coverage, vehicle details, and policy terms.",
  },
  {
    question: "When does my policy expire?",
    answer:
      "Your policy expiration date is shown on each policy card. Policies that are due to expire within 30 days will be highlighted with a 'DUE TO RENEW' status to help you stay on top of renewals.",
  },
  {
    question:
      "Why isn’t my insurance showing on the Motor Insurance Database (MID)?",
    answer:
      "Temporary insurance policies, like the ones we provide, are often short-term and can begin and end within a very short time frame. Because of this, there can be a delay of 24 to 48 hours or sometimes longer before your policy is updated on the Motor Insurance Database (MID). This is standard across the insurance industry and not unique to our service. In some cases, your temporary policy may even expire before it appears on the MID. Don’t worry—this does not affect the validity of your insurance. Your policy documentation and certificate of insurance serve as your legal proof of cover. If required by the police or any other authority, you can show your certificate to demonstrate that you are insured during the policy period.",
  },
  {
    question: "How can I contact customer support?",
    answer:
      "For any questions or assistance, please contact our Aviva customer support team via email or phone. Our support hours are Monday to Friday, 9 AM to 6 PM.",
  },
  {
    question: "What should I do if my vehicle details are incorrect?",
    answer:
      "If you notice any incorrect vehicle information in your policy, please contact our Aviva customer support team immediately. They will help you update the details and ensure your coverage is accurate.",
  },
  {
    question: "Can I have multiple policies?",
    answer:
      "Yes, you can have multiple insurance policies for different vehicles. Each policy will be displayed separately on your dashboard with its own policy number and details.",
  },
  {
    question: "What does the policy status mean?",
    answer:
      "Policy statuses include: ACTIVE (currently valid), DUE TO RENEW (expires within 30 days), and EXPIRED (no longer valid). Make sure to renew your policy before it expires to maintain continuous coverage.",
  },
  {
    question: "How is my premium calculated?",
    answer:
      "Your insurance premium is calculated based on various factors including your vehicle's make, model, year, safety ratings, your driving history, and coverage options selected.",
  },
  {
    question: "What vehicle information is used for my policy?",
    answer:
      "We use comprehensive vehicle data including make, model, year, engine specifications, safety ratings, MOT history, tax status, and other technical details to ensure accurate coverage and pricing.",
  },
  {
    question: "How often should I review my policy?",
    answer:
      "We recommend reviewing your policy annually or whenever you make changes to your vehicle. This ensures your coverage remains appropriate and up-to-date.",
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== "user") {
          router.push("/");
          return;
        }
      } else {
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mobile-content px-4 py-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-600 mb-6">
          Find answers to common questions about your Aviva insurance policies
        </p>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => (
            <Card key={index} className="overflow-hidden">
              <Collapsible
                open={openItems.includes(index)}
                onOpenChange={() => toggleItem(index)}
              >
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-left text-base font-medium text-gray-900">
                        {item.question}
                      </CardTitle>
                      {openItems.includes(index) ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <p className="text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>

        {/* Contact Support */}
        <Card className="mt-8 bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">Still need help?</CardTitle>
            <CardDescription className="text-yellow-700">
              If you couldn't find the answer you're looking for, our Aviva
              customer support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-yellow-800">
              <p>
                <strong>Email:</strong> support@avivaflex.com
              </p>
              <p>
                <strong>Phone:</strong> 0800 123 4567
              </p>
              <p>
                <strong>Hours:</strong> Monday - Friday, 9 AM - 6 PM
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
