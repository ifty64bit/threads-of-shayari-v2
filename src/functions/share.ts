import { Resvg } from "@resvg/resvg-js";
import { createServerFn } from "@tanstack/react-start";
import satori from "satori";
import { z } from "zod";
import { db } from "@/db";
import { serverConfig } from "@/lib/server-config";
import { authMiddleware } from "@/middleware/auth";

// Load a font for Satori
async function loadFont(): Promise<ArrayBuffer> {
	const response = await fetch(
		"https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/inter-latin-600-normal.woff",
	);
	return await response.arrayBuffer();
}

export const generatePostCard = createServerFn({ method: "GET" })
	.middleware([authMiddleware])
	.inputValidator(z.object({ postId: z.number() }))
	.handler(async ({ data }) => {
		// Get the post data
		const post = await db.query.posts.findFirst({
			where: (posts, { eq }) => eq(posts.id, data.postId),
			with: {
				author: {
					columns: {
						id: true,
						name: true,
						username: true,
						image: true,
					},
				},
				images: true,
			},
		});

		if (!post) {
			throw new Error("Post not found");
		}

		// Helper function to construct Cloudinary URL
		function getImageUrl(publicIdOrUrl: string): string {
			if (publicIdOrUrl.startsWith("http")) {
				return publicIdOrUrl;
			}
			return `https://res.cloudinary.com/dx39kajoq/image/upload/${publicIdOrUrl}`;
		}

		// Helper function to fetch image as base64 with correct mime type
		async function fetchImageAsBase64(publicIdOrUrl: string): Promise<string> {
			try {
				const url = getImageUrl(publicIdOrUrl);
				console.log("Fetching image:", url);
				const response = await fetch(url);
				if (!response.ok) {
					console.error(`Failed to fetch image: ${response.status}`);
					return "";
				}
				const contentType = response.headers.get("content-type") || "image/png";
				const buffer = await response.arrayBuffer();
				return `data:${contentType};base64,${Buffer.from(buffer).toString("base64")}`;
			} catch (error) {
				console.error("Failed to fetch image:", error);
				return "";
			}
		}

		// Fetch profile image as base64
		let profileImageBase64 = "";
		if (post.author.image) {
			profileImageBase64 = await fetchImageAsBase64(post.author.image);
		}

		// Fetch first post image as base64 (if exists)
		let postImageBase64 = "";
		if (post.images && post.images.length > 0) {
			postImageBase64 = await fetchImageAsBase64(post.images[0].url);
		}

		// Load font
		const fontData = await loadFont();

		// Truncate content if too long
		const displayContent =
			post.content.length > 280
				? `${post.content.slice(0, 280)}...`
				: post.content;

		// Create the card with Satori using JSX-like createElement format
		const { createElement: h } = await import("react");

		const svg = await satori(
			h(
				"div",
				{
					style: {
						width: "100%",
						display: "flex",
						flexDirection: "column",
						background:
							"linear-gradient(135deg, #7c3aed 0%, #9333ea 50%, #4f46e5 100%)",
						padding: "32px",
						fontFamily: "Inter",
					},
				},
				// Author Info
				h(
					"div",
					{
						style: {
							display: "flex",
							alignItems: "center",
							gap: "16px",
							marginBottom: "20px",
						},
					},
					// Profile Image
					profileImageBase64
						? h("img", {
								src: profileImageBase64,
								width: 56,
								height: 56,
								style: {
									borderRadius: "50%",
									objectFit: "cover",
									border: "3px solid rgba(255, 255, 255, 0.3)",
								},
							})
						: h("div", {
								style: {
									width: 56,
									height: 56,
									borderRadius: "50%",
									backgroundColor: "rgba(255, 255, 255, 0.2)",
								},
							}),
					// Name and Username
					h(
						"div",
						{
							style: {
								display: "flex",
								flexDirection: "column",
							},
						},
						h(
							"span",
							{
								style: {
									color: "#ffffff",
									fontSize: 20,
									fontWeight: 600,
								},
							},
							post.author.name,
						),
						h(
							"span",
							{
								style: {
									color: "rgba(255, 255, 255, 0.7)",
									fontSize: 14,
								},
							},
							`@${post.author.username}`,
						),
					),
				),
				// Content Box
				h(
					"div",
					{
						style: {
							backgroundColor: "rgba(255, 255, 255, 0.1)",
							borderRadius: "16px",
							padding: "20px",
							display: "flex",
							flexDirection: "column",
						},
					},
					// Post Content
					h(
						"p",
						{
							style: {
								color: "#ffffff",
								fontSize: 16,
								lineHeight: 1.6,
								margin: 0,
								whiteSpace: "pre-wrap",
								overflow: "hidden",
							},
						},
						displayContent,
					),
					// Post Image (if exists)
					postImageBase64
						? h("img", {
								src: postImageBase64,
								style: {
									width: "100%",
									height: 180,
									objectFit: "cover",
									borderRadius: "12px",
									marginTop: "16px",
								},
							})
						: null,
				),
				// Branding
				h(
					"div",
					{
						style: {
							display: "flex",
							justifyContent: "flex-end",
							marginTop: "16px",
						},
					},
					h(
						"span",
						{
							style: {
								color: "rgba(255, 255, 255, 0.5)",
								fontSize: 12,
							},
						},
						serverConfig.BRAND_NAME,
					),
				),
			),
			{
				width: 400,
				fonts: [
					{
						name: "Inter",
						data: fontData,
						weight: 600,
						style: "normal",
					},
				],
			},
		);

		// Convert SVG to PNG using resvg
		const resvg = new Resvg(svg, {
			background: "transparent",
			fitTo: {
				mode: "width",
				value: 800,
			},
		});

		const pngData = resvg.render();
		const pngBuffer = pngData.asPng();

		// Return as base64
		return `data:image/png;base64,${Buffer.from(pngBuffer).toString("base64")}`;
	});
