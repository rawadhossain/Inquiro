import { BarChart3, Brain, Lock, Palette, Settings2, Zap } from "lucide-react";

export default function Features() {
	return (
		<section id="features" className="py-12 md:py-20">
			<div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
				<div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
					<h2 className="text-balance text-4xl font-medium lg:text-5xl">
						Everything you need to collect meaningful feedback
					</h2>
					<p>
						Inquiro empowers you to create, distribute, and analyze surveys with
						intelligent features that turn responses into actionable insights.
					</p>
				</div>

				<div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<Zap className="size-4" />
							<h3 className="text-sm font-medium">Lightning Fast</h3>
						</div>
						<p className="text-sm">
							Create and deploy surveys in minutes, not hours. Get responses
							instantly.
						</p>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Brain className="size-4" />
							<h3 className="text-sm font-medium">AI-Powered</h3>
						</div>
						<p className="text-sm">
							Generate intelligent survey questions with simple prompts.
						</p>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Lock className="size-4" />
							<h3 className="text-sm font-medium">Secure & Private</h3>
						</div>
						<p className="text-sm">
							Your data is protected with enterprise-grade security and privacy
							controls.
						</p>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Palette className="size-4" />
							<h3 className="text-sm font-medium">Customizable</h3>
						</div>
						<p className="text-sm">
							Brand your surveys with custom themes and question types that fit your
							needs.
						</p>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<Settings2 className="size-4" />
							<h3 className="text-sm font-medium">Full Control</h3>
						</div>
						<p className="text-sm">
							Manage access, set response limits, and control who can participate.
						</p>
					</div>
					<div className="space-y-2">
						<div className="flex items-center gap-2">
							<BarChart3 className="size-4" />
							<h3 className="text-sm font-medium">Real-time Analytics</h3>
						</div>
						<p className="text-sm">
							Track responses as they come in with detailed analytics and
							visualizations.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
