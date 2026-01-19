"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

export default function FAQs() {
	const faqItems = [
		{
			id: "item-2",
			question: "How does the AI survey generation work?",
			answer: "Our AI assistant helps you create professional surveys by suggesting relevant questions based on your topic and goals. Simply describe what you want to learn, and our AI will generate a complete survey structure for you to customize.",
		},
		{
			id: "item-3",
			question: "Can I share surveys with people who don't have an account?",
			answer: "Absolutely! You can share surveys via public links, embed them on websites, or send private invitation tokens. Respondents don't need to create an account to participate in your surveys.",
		},
		{
			id: "item-4",
			question: "What question types are supported?",
			answer: "Inquiro supports multiple choice, text input, rating scales, checkboxes, radio buttons, and more. You can also add conditional logic to create dynamic surveys that adapt based on previous responses.",
		},
		{
			id: "item-5",
			question: "How secure is my survey data?",
			answer: "We take data security seriously. All survey responses are encrypted in transit and at rest. You have full control over who can access your surveys, and we never share your data with third parties. GDPR compliant data handling is included.",
		},
		{
			id: "item-6",
			question: "Can I export my survey results?",
			answer: "Yes! You can export your survey data in  CSV. Real-time analytics dashboards are also available to visualize your results instantly.",
		},
	];

	return (
		<section id="faq" className="py-16 md:py-24">
			<div className="mx-auto max-w-5xl px-4 md:px-6">
				<div className="mx-auto max-w-xl text-center">
					<h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">
						Frequently Asked Questions
					</h2>
					<p className="text-muted-foreground mt-4 text-balance">
						Get answers to common questions about creating surveys, collecting
						responses, and analyzing data with Inquiro.
					</p>
				</div>

				<div className="mx-auto mt-12 max-w-xl">
					<Accordion
						type="single"
						collapsible
						className="bg-muted dark:bg-muted/50 w-full rounded-2xl p-1"
					>
						{faqItems.map((item) => (
							<div className="group" key={item.id}>
								<AccordionItem
									value={item.id}
									className="data-[state=open]:bg-card dark:data-[state=open]:bg-muted peer rounded-xl border-none px-7 py-1 data-[state=open]:border-none data-[state=open]:shadow-sm"
								>
									<AccordionTrigger className="cursor-pointer text-base hover:no-underline">
										{item.question}
									</AccordionTrigger>
									<AccordionContent>
										<p className="text-base">{item.answer}</p>
									</AccordionContent>
								</AccordionItem>
								<hr className="mx-7 border-dashed group-last:hidden peer-data-[state=open]:opacity-0" />
							</div>
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}
