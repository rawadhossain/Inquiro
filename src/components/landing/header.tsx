"use client";
import Link from "next/link";
import { Logo } from "@/components/landing/logo";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import ThemeSwitch from "@/components/ui/theme-switch";

const menuItems = [
	{ name: "Features", href: "#features" },
	{ name: "FAQs", href: "#faq" },
];

export const HeroHeader = () => {
	const [menuState, setMenuState] = React.useState(false);
	const [isScrolled, setIsScrolled] = React.useState(false);

	React.useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleSmoothScroll = (href: string, e: React.MouseEvent) => {
		e.preventDefault();
		setMenuState(false); // Close mobile menu

		// Handle scroll to top for home link
		if (href === "/" || href === "#top") {
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
			return;
		}

		const targetId = href.replace("#", "");
		const targetElement = document.getElementById(targetId);

		if (targetElement) {
			const headerOffset = 80; // Account for fixed header
			const elementPosition = targetElement.getBoundingClientRect().top;
			const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

			window.scrollTo({
				top: offsetPosition,
				behavior: "smooth",
			});
		}
	};

	// Handle logo click to scroll to top
	const handleLogoClick = (e: React.MouseEvent) => {
		if (window.location.pathname === "/") {
			e.preventDefault();
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	};

	return (
		<header>
			<nav data-state={menuState && "active"} className="fixed z-20 w-full px-2">
				<div
					className={cn(
						"mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
						isScrolled &&
							"bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
					)}
					suppressHydrationWarning
				>
					<div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
						<div className="flex w-full justify-between lg:w-auto">
							<Link
								href="/"
								aria-label="home"
								onClick={handleLogoClick}
								className="flex items-center space-x-2 cursor-pointer"
							>
								<Logo />
							</Link>

							<button
								onClick={() => setMenuState(!menuState)}
								aria-label={menuState == true ? "Close Menu" : "Open Menu"}
								className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
							>
								<Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
								<X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
							</button>
						</div>

						<div className="absolute inset-0 m-auto hidden size-fit lg:block">
							<ul className="flex gap-8 text-sm">
								{menuItems.map((item, index) => (
									<li key={index}>
										<Link
											href={item.href}
											onClick={(e) => handleSmoothScroll(item.href, e)}
											className="text-muted-foreground hover:text-accent-foreground block duration-150 cursor-pointer"
										>
											<span>{item.name}</span>
										</Link>
									</li>
								))}
							</ul>
						</div>

						<div className="bg-background in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
							<div className="lg:hidden">
								<ul className="space-y-6 text-base">
									{menuItems.map((item, index) => (
										<li key={index}>
											<Link
												href={item.href}
												onClick={(e) => handleSmoothScroll(item.href, e)}
												className="text-muted-foreground hover:text-accent-foreground block duration-150 cursor-pointer"
											>
												<span>{item.name}</span>
											</Link>
										</li>
									))}
								</ul>
							</div>
							<div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
								<ThemeSwitch />
								<Button
									asChild
									variant="outline"
									size="sm"
									className={cn(isScrolled && "lg:hidden")}
								>
									<Link href="/signin">
										<span>Sign In</span>
									</Link>
								</Button>
								<Button asChild size="sm" className={cn(isScrolled && "lg:hidden")}>
									<Link href="/signup">
										<span>Sign Up</span>
									</Link>
								</Button>
								<Button
									asChild
									size="sm"
									className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
								>
									<Link href="/signup">
										<span>Get Started</span>
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</div>
			</nav>
		</header>
	);
};
