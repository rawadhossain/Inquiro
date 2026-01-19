import { cn } from "../../lib/utils";

export const Logo = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
	return (
		<svg
			viewBox="0 0 90 18"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={cn("text-foreground h-5 w-auto", className)}
		>
			<path
				d="M3 0H5V18H3V0ZM13 0H15V18H13V0ZM18 3V5H0V3H18ZM0 15V13H18V15H0Z"
				fill={uniColor ? "currentColor" : "url(#logo-gradient)"}
			/>
			<text
				x="22"
				y="13"
				fontSize="12"
				fontWeight="600"
				fontFamily="Inter, system-ui, sans-serif"
				fill="currentColor"
			>
				Inquiro
			</text>
			<defs>
				<linearGradient
					id="logo-gradient"
					x1="10"
					y1="0"
					x2="10"
					y2="20"
					gradientUnits="userSpaceOnUse"
				>
					<stop stopColor="#9B99FE" />
					<stop offset="1" stopColor="#2BC8B7" />
				</linearGradient>
			</defs>
		</svg>
	);
};

// ... existing code ...
